import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { decrypt } from '../../common/utils/encryption';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number; status?: string; category?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const where: any = { tenantId, deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    const [templates, total] = await Promise.all([
      this.prisma.whatsAppTemplate.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { phoneNumber: { select: { displayPhoneNumber: true } } },
      }),
      this.prisma.whatsAppTemplate.count({ where }),
    ]);

    return { items: templates, total, page, pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const t = await this.prisma.whatsAppTemplate.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }

  async create(tenantId: string, dto: any) {
    // Fall back to the tenant's connected number if none specified
    let phoneNumberId = dto.phoneNumberId;
    if (!phoneNumberId) {
      const number = await this.prisma.whatsAppPhoneNumber.findFirst({
        where: { tenantId, status: 'CONNECTED' },
        orderBy: { createdAt: 'desc' },
      });
      if (!number) {
        throw new BadRequestException('Connect a WhatsApp number before creating templates');
      }
      phoneNumberId = number.phoneNumberId;
    }

    return this.prisma.whatsAppTemplate.create({
      data: {
        tenantId,
        phoneNumberId,
        name: dto.name,
        category: dto.category,
        language: dto.language || 'en',
        headerType: dto.headerType,
        headerContent: dto.headerContent,
        body: dto.body,
        bodyVariables: dto.bodyVariables || [],
        footer: dto.footer,
        buttons: dto.buttons || [],
        status: 'DRAFT',
      },
    });
  }

  async submit(tenantId: string, id: string) {
    const template = await this.findOne(tenantId, id);
    if (!['DRAFT', 'REJECTED'].includes(template.status)) {
      throw new BadRequestException('Only draft or rejected templates can be submitted');
    }

    // Get access token
    const phoneNumber = await this.prisma.whatsAppPhoneNumber.findFirstOrThrow({
      where: { phoneNumberId: template.phoneNumberId, tenantId },
    });

    const waba = await this.prisma.whatsAppBusinessAccount.findFirstOrThrow({
      where: { wabaId: phoneNumber.wabaId },
    });

    const accessToken = decrypt(waba.accessTokenEncrypted!);

    // Build Meta API payload
    const components: any[] = [];
    if (template.headerType) {
      components.push({ type: 'HEADER', format: template.headerType, ...(template.headerContent && { text: template.headerContent }) });
    }
    components.push({ type: 'BODY', text: template.body });
    if (template.footer) components.push({ type: 'FOOTER', text: template.footer });
    if ((template.buttons as any[])?.length > 0) {
      components.push({ type: 'BUTTONS', buttons: template.buttons });
    }

    const result = await this.whatsapp.submitTemplate(waba.wabaId, accessToken, {
      name: template.name,
      category: template.category,
      language: template.language,
      components,
    });

    return this.prisma.whatsAppTemplate.update({
      where: { id },
      data: { status: 'SUBMITTED', externalId: result.id, submittedAt: new Date() },
    });
  }

  async syncFromMeta(tenantId: string, wabaId: string) {
    const waba = await this.prisma.whatsAppBusinessAccount.findFirstOrThrow({ where: { wabaId, tenantId } });
    const accessToken = decrypt(waba.accessTokenEncrypted!);
    const result = await this.whatsapp.getTemplates(wabaId, accessToken);

    for (const t of result.data || []) {
      await this.prisma.whatsAppTemplate.updateMany({
        where: { externalId: t.id },
        data: { status: this.mapMetaStatus(t.status), rejectionReason: t.rejected_reason },
      });
    }

    return { synced: result.data?.length || 0 };
  }

  private mapMetaStatus(metaStatus: string): any {
    const map: Record<string, string> = {
      APPROVED: 'APPROVED', REJECTED: 'REJECTED', PENDING: 'PENDING',
      DISABLED: 'DISABLED', PAUSED: 'PAUSED', IN_APPEAL: 'PENDING',
    };
    return map[metaStatus] || 'PENDING';
  }
}
