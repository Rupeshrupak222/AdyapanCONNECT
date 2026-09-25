import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { DeveloperApiService } from './developer-api.service';

@ApiTags('Developer')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('developer')
export class DeveloperApiController {
  constructor(private readonly service: DeveloperApiService) {}

  @Get('api-keys')
  @RequirePermissions('developer.api.view')
  listKeys(@TenantId() tenantId: string) { return this.service.listApiKeys(tenantId); }

  @Post('api-keys')
  @RequirePermissions('developer.api.create')
  createKey(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: any) {
    return this.service.createApiKey(tenantId, userId, dto);
  }

  @Delete('api-keys/:id')
  @RequirePermissions('developer.api.create')
  revokeKey(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.revokeApiKey(tenantId, id);
  }

  @Get('usage')
  @RequirePermissions('developer.api.view')
  getUsage(@TenantId() tenantId: string, @Query('days') days = 30) {
    return this.service.getUsage(tenantId, Number(days));
  }
}
