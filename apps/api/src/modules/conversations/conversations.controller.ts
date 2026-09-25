import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ConversationsService } from './conversations.service';

@ApiTags('Conversations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @RequirePermissions('conversation.view')
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.conversationsService.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions('conversation.view')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.conversationsService.findOne(tenantId, id);
  }

  @Patch(':id/assign')
  @RequirePermissions('conversation.assign')
  assign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { agentId: string | null },
    @CurrentUserId() userId: string,
  ) {
    return this.conversationsService.assign(tenantId, id, dto.agentId, userId);
  }

  @Patch(':id/status')
  @RequirePermissions('conversation.close')
  updateStatus(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: { status: string }) {
    return this.conversationsService.updateStatus(tenantId, id, dto.status);
  }

  @Post(':id/labels')
  @RequirePermissions('conversation.view')
  addLabel(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { label: string },
    @CurrentUserId() userId: string,
  ) {
    return this.conversationsService.addLabel(tenantId, id, dto.label, userId);
  }

  @Post(':id/notes')
  @RequirePermissions('conversation.view')
  addNote(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { content: string; isInternal?: boolean },
    @CurrentUserId() userId: string,
  ) {
    return this.conversationsService.addNote(tenantId, id, dto.content, userId, dto.isInternal);
  }

  @Post(':id/read')
  markRead(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.conversationsService.markRead(tenantId, id);
  }
}
