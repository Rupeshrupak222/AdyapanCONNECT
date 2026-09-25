import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CrmService } from './crm.service';

@ApiTags('CRM')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('leads')
  @RequirePermissions('crm.view')
  getLeads(@TenantId() tenantId: string, @Query() q: any) { return this.crmService.getLeads(tenantId, q); }

  @Post('leads')
  @RequirePermissions('crm.manage')
  createLead(@TenantId() tenantId: string, @Body() dto: any) { return this.crmService.createLead(tenantId, dto); }

  @Put('leads/:id')
  @RequirePermissions('crm.manage')
  updateLead(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) { return this.crmService.updateLead(tenantId, id, dto); }

  @Get('deals')
  @RequirePermissions('crm.view')
  getDeals(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) { return this.crmService.getDeals(tenantId, pipelineId); }

  @Post('deals')
  @RequirePermissions('crm.manage')
  createDeal(@TenantId() tenantId: string, @Body() dto: any) { return this.crmService.createDeal(tenantId, dto); }

  @Put('deals/:id')
  @RequirePermissions('crm.manage')
  updateDeal(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) { return this.crmService.updateDeal(tenantId, id, dto); }

  @Get('pipelines')
  @RequirePermissions('crm.view')
  getPipelines(@TenantId() tenantId: string) { return this.crmService.getPipelines(tenantId); }

  @Post('pipelines')
  @RequirePermissions('crm.manage')
  createPipeline(@TenantId() tenantId: string, @Body() dto: any) { return this.crmService.createPipeline(tenantId, dto); }

  @Get('tasks')
  @RequirePermissions('crm.view')
  getTasks(@TenantId() tenantId: string, @Query() q: any) { return this.crmService.getTasks(tenantId, q); }

  @Post('tasks')
  @RequirePermissions('crm.manage')
  createTask(@TenantId() tenantId: string, @Body() dto: any) { return this.crmService.createTask(tenantId, dto); }

  @Put('tasks/:id')
  @RequirePermissions('crm.manage')
  updateTask(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) { return this.crmService.updateTask(tenantId, id, dto); }
}
