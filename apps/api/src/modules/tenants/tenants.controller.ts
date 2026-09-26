import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './tenants.dto';

@ApiTags('Tenants')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('tenant')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @RequirePermissions('settings.view')
  get(@TenantId() tenantId: string) { return this.tenantsService.findById(tenantId); }

  @Put()
  @RequirePermissions('settings.manage')
  update(@TenantId() tenantId: string, @Body() dto: UpdateTenantDto) { return this.tenantsService.update(tenantId, dto); }

  @Get('members')
  @RequirePermissions('team.manage')
  getMembers(@TenantId() tenantId: string) { return this.tenantsService.getMembers(tenantId); }

  @Post('members/invite')
  @RequirePermissions('team.invite')
  invite(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: { email: string; roleId: string }) {
    return this.tenantsService.inviteMember(tenantId, dto.email, dto.roleId, userId);
  }

  @Delete('members/:userId')
  @RequirePermissions('team.remove')
  remove(@TenantId() tenantId: string, @Param('userId') userId: string) {
    return this.tenantsService.removeMember(tenantId, userId);
  }

  @Get('stats')
  getStats(@TenantId() tenantId: string) { return this.tenantsService.getStats(tenantId); }
}
