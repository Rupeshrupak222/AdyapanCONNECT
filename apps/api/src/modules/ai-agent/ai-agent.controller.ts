import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AiAgentService } from './ai-agent.service';
import { CreateAgentDto, UpdateAgentDto, CreateKnowledgeBaseDto, AddDocumentDto } from './ai-agent.dto';

@ApiTags('AI Agent')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('ai')
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Get('agents')
  @RequirePermissions('ai_agent.view')
  findAll(@TenantId() tenantId: string) { return this.aiAgentService.findAll(tenantId); }

  @Post('agents')
  @RequirePermissions('ai_agent.create')
  create(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: CreateAgentDto) {
    return this.aiAgentService.create(tenantId, userId, dto);
  }

  @Put('agents/:id')
  @RequirePermissions('ai_agent.edit')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.aiAgentService.update(tenantId, id, dto);
  }

  @Post('agents/:id/test')
  @RequirePermissions('ai_agent.view')
  testAgent(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: { message: string }) {
    return this.aiAgentService.testAgent(tenantId, id, dto?.message || 'Hello');
  }

  @Delete('agents/:id')
  @RequirePermissions('ai_agent.edit')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.aiAgentService.delete(tenantId, id);
  }

  @Get('knowledge-bases')
  @RequirePermissions('ai_agent.view')
  getKnowledgeBases(@TenantId() tenantId: string) { return this.aiAgentService.getKnowledgeBases(tenantId); }

  @Post('knowledge-bases')
  @RequirePermissions('ai_agent.create')
  createKnowledgeBase(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: CreateKnowledgeBaseDto) {
    return this.aiAgentService.createKnowledgeBase(tenantId, userId, dto);
  }

  @Post('knowledge-bases/:id/documents')
  @RequirePermissions('ai_agent.create')
  addDocument(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: AddDocumentDto) {
    return this.aiAgentService.addDocument(tenantId, id, dto);
  }
}
