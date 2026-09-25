import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @RequirePermissions('conversation.view')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getMessages(
    @TenantId() tenantId: string,
    @Param('conversationId') conversationId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 50,
  ) {
    return this.messagesService.getConversationMessages(tenantId, conversationId, page, pageSize);
  }

  @Post()
  @RequirePermissions('conversation.reply')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  async sendMessage(
    @TenantId() tenantId: string,
    @CurrentUserId() userId: string,
    @Param('conversationId') conversationId: string,
    @Body() dto: {
      type: string;
      content?: string;
      mediaUrl?: string;
      templateId?: string;
      templateData?: any;
      interactiveData?: any;
      replyToId?: string;
    },
  ) {
    return this.messagesService.sendMessage(tenantId, { ...dto, conversationId, sentById: userId });
  }
}
