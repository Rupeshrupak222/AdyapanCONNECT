import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../../database/prisma.service';
import { encrypt } from '../../common/utils/encryption';

@ApiTags('WhatsApp')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('numbers')
  @RequirePermissions('whatsapp.view')
  @ApiOperation({ summary: 'Get all WhatsApp numbers for tenant' })
  async getNumbers(@TenantId() tenantId: string) {
    return this.prisma.whatsAppPhoneNumber.findMany({
      where: { tenantId },
      include: { waba: { select: { id: true, name: true } } },
    });
  }

  @Get('numbers/:id')
  @RequirePermissions('whatsapp.view')
  async getNumber(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.prisma.whatsAppPhoneNumber.findFirstOrThrow({
      where: { id, tenantId },
    });
  }

  @Delete('numbers/:id')
  @RequirePermissions('whatsapp.connect')
  @ApiOperation({ summary: 'Delete/Disconnect a WhatsApp number' })
  async deleteNumber(@TenantId() tenantId: string, @Param('id') id: string) {
    const num = await this.prisma.whatsAppPhoneNumber.findFirst({ where: { id, tenantId } });
    if (!num) throw new BadRequestException('Number not found');
    await this.prisma.whatsAppPhoneNumber.delete({ where: { id } });
    return { success: true, id };
  }

  @Post('numbers/:id/sync')
  @RequirePermissions('whatsapp.manage')
  @ApiOperation({ summary: 'Sync phone number status from Meta' })
  async syncNumber(@Param('id') phoneNumberId: string) {
    return this.whatsappService.syncPhoneNumberStatus(phoneNumberId);
  }

  @Post('connect')
  @RequirePermissions('whatsapp.connect')
  @ApiOperation({ summary: 'Connect a WhatsApp number via embedded signup' })
  async connectNumber(
    @TenantId() tenantId: string,
    @Body() dto: { wabaId: string; phoneNumberId: string; displayPhoneNumber: string; accessToken: string; businessName: string },
  ) {
    // Encrypt and store token
    const encryptedToken = encrypt(dto.accessToken);

    // Verify connection first
    await this.whatsappService.getPhoneNumberInfo(dto.phoneNumberId, dto.accessToken);

    let waba = await this.prisma.whatsAppBusinessAccount.findUnique({
      where: { wabaId: dto.wabaId },
    });

    if (!waba) {
      const wabaInfo = await this.whatsappService.getWabaInfo(dto.wabaId, dto.accessToken);
      waba = await this.prisma.whatsAppBusinessAccount.create({
        data: {
          tenantId,
          wabaId: dto.wabaId,
          name: wabaInfo.name || 'My Business',
          accessTokenEncrypted: encryptedToken,
        },
      });
    }

    return this.prisma.whatsAppPhoneNumber.upsert({
      where: { phoneNumberId: dto.phoneNumberId },
      create: {
        tenantId,
        wabaId: dto.wabaId,
        phoneNumberId: dto.phoneNumberId,
        displayPhoneNumber: dto.displayPhoneNumber,
        businessName: dto.businessName,
        status: 'CONNECTED',
        accessTokenEncrypted: encryptedToken,
      },
      update: {
        status: 'CONNECTED',
        accessTokenEncrypted: encryptedToken,
        lastSyncAt: new Date(),
      },
    });
  }

  @Post('embedded-signup')
  @RequirePermissions('whatsapp.connect')
  @ApiOperation({ summary: 'Complete Meta Embedded Signup: exchange code, discover WABA + number, connect' })
  async embeddedSignup(
    @TenantId() tenantId: string,
    @Body() dto: { code: string; wabaId?: string; phoneNumberId?: string },
  ) {
    // 1) Exchange the Facebook Login code for an access token
    const accessToken = await this.whatsappService.exchangeCodeForToken(dto.code);

    // 2) Determine the WABA (from the signup payload, else discover from token)
    let wabaId = dto.wabaId;
    if (!wabaId) {
      const wabas = await this.whatsappService.getSharedWabas(accessToken);
      wabaId = wabas[0];
    }
    if (!wabaId) throw new BadRequestException('No WhatsApp Business Account was shared. Please try connecting again.');

    // 3) Subscribe our app to this WABA's webhooks
    await this.whatsappService.subscribeAppToWaba(wabaId, accessToken);

    // 4) Fetch WABA info + its phone numbers
    const wabaInfo = await this.whatsappService.getWabaInfo(wabaId, accessToken);
    const numbersResp = await this.whatsappService.getPhoneNumbers(wabaId, accessToken);
    const numbers = numbersResp?.data || [];
    const chosen = dto.phoneNumberId
      ? numbers.find((n: any) => n.id === dto.phoneNumberId) || numbers[0]
      : numbers[0];
    if (!chosen) throw new BadRequestException('No phone number found on this WhatsApp Business Account.');

    // 5) Register the number for Cloud API messaging
    await this.whatsappService.registerPhoneNumber(chosen.id, accessToken);

    // 6) Persist WABA + phone number with the encrypted token
    const encryptedToken = encrypt(accessToken);
    await this.prisma.whatsAppBusinessAccount.upsert({
      where: { wabaId },
      create: { tenantId, wabaId, name: wabaInfo.name || 'My Business', accessTokenEncrypted: encryptedToken, isActive: true },
      update: { accessTokenEncrypted: encryptedToken, name: wabaInfo.name || undefined, isActive: true },
    });

    const number = await this.prisma.whatsAppPhoneNumber.upsert({
      where: { phoneNumberId: chosen.id },
      create: {
        tenantId,
        wabaId,
        phoneNumberId: chosen.id,
        displayPhoneNumber: chosen.display_phone_number,
        businessName: wabaInfo.name || 'My Business',
        verifiedName: chosen.verified_name,
        qualityRating: chosen.quality_rating || 'UNKNOWN',
        status: 'CONNECTED',
        accessTokenEncrypted: encryptedToken,
        lastSyncAt: new Date(),
      },
      update: {
        status: 'CONNECTED',
        accessTokenEncrypted: encryptedToken,
        displayPhoneNumber: chosen.display_phone_number,
        verifiedName: chosen.verified_name,
        lastSyncAt: new Date(),
      },
    });

    return { status: 'connected', number };
  }

  @Patch('numbers/:id/disconnect')
  @RequirePermissions('whatsapp.manage')
  async disconnectNumber(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.prisma.whatsAppPhoneNumber.updateMany({
      where: { id, tenantId },
      data: { status: 'DISCONNECTED' },
    });
  }

  @Post('sandbox')
  @RequirePermissions('whatsapp.connect')
  @ApiOperation({ summary: 'Provision a demo/sandbox WhatsApp number (dev — no Meta required)' })
  async provisionSandbox(@TenantId() tenantId: string) {
    // Reuse existing sandbox number for this tenant if present
    const existing = await this.prisma.whatsAppPhoneNumber.findFirst({
      where: { tenantId, status: 'CONNECTED' },
    });
    if (existing) return existing;

    const suffix = tenantId.slice(-8);
    const wabaId = `sandbox-waba-${suffix}`;
    const phoneNumberId = `sandbox-phone-${suffix}`;

    await this.prisma.whatsAppBusinessAccount.upsert({
      where: { wabaId },
      create: { tenantId, wabaId, name: 'Sandbox Business Account', isActive: true },
      update: {},
    });

    return this.prisma.whatsAppPhoneNumber.upsert({
      where: { phoneNumberId },
      create: {
        tenantId,
        wabaId,
        phoneNumberId,
        displayPhoneNumber: '+91 91777 03046',
        businessName: 'Sandbox Number',
        status: 'CONNECTED',
        qualityRating: 'GREEN',
        messagingLimit: '1K',
        verifiedName: 'Sandbox Business',
      },
      update: { status: 'CONNECTED' },
    });
  }
}
