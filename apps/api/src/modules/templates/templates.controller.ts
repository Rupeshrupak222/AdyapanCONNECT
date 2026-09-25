import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @RequirePermissions('template.view')
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.templatesService.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('template.view')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions('template.create')
  create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.templatesService.create(tenantId, dto);
  }

  @Post(':id/submit')
  @RequirePermissions('template.create')
  submit(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.templatesService.submit(tenantId, id);
  }

  @Post('sync/:wabaId')
  @RequirePermissions('template.view')
  sync(@TenantId() tenantId: string, @Param('wabaId') wabaId: string) {
    return this.templatesService.syncFromMeta(tenantId, wabaId);
  }
}
