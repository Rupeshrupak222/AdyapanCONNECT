import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { WorkflowsService } from './workflows.service';

@ApiTags('Workflows')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @RequirePermissions('workflow.view')
  findAll(@TenantId() tenantId: string) { return this.workflowsService.findAll(tenantId); }

  @Post()
  @RequirePermissions('workflow.create')
  create(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: any) {
    return this.workflowsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @RequirePermissions('workflow.edit')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.workflowsService.update(tenantId, id, dto);
  }

  @Post(':id/toggle')
  @RequirePermissions('workflow.edit')
  toggle(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: { active: boolean }) {
    return this.workflowsService.toggle(tenantId, id, dto.active);
  }

  @Delete(':id')
  @RequirePermissions('workflow.delete')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.workflowsService.delete(tenantId, id);
  }
}
