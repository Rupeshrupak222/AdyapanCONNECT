import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ChatbotService } from './chatbot.service';

@ApiTags('Chatbot')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('chatbots')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get()
  @RequirePermissions('chatbot.view')
  findAll(@TenantId() tenantId: string) { return this.chatbotService.findAll(tenantId); }

  @Post()
  @RequirePermissions('chatbot.create')
  create(@TenantId() tenantId: string, @CurrentUserId() userId: string, @Body() dto: any) {
    return this.chatbotService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @RequirePermissions('chatbot.edit')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.chatbotService.update(tenantId, id, dto);
  }

  @Post(':id/flow')
  @RequirePermissions('chatbot.edit')
  saveFlow(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.chatbotService.saveFlow(tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('chatbot.delete')
  delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.chatbotService.delete(tenantId, id);
  }
}
