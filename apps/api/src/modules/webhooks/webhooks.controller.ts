import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './webhooks.dto';

@ApiTags('Webhooks')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @RequirePermissions('developer.webhook.manage')
  findAll(@TenantId() tenantId: string) { return this.webhooksService.findAll(tenantId); }

  @Post()
  @RequirePermissions('developer.webhook.manage')
  create(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.create(tenantId, userId, dto);
  }

  @Delete(':id')
  @RequirePermissions('developer.webhook.manage')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhooksService.delete(tenantId, id);
  }

  @Get(':id/deliveries')
  @RequirePermissions('developer.webhook.manage')
  getLogs(@TenantId() tenantId: string, @Param('id') id: string, @Query('page') page = 1) {
    return this.webhooksService.getDeliveryLogs(tenantId, id, Number(page));
  }
}
