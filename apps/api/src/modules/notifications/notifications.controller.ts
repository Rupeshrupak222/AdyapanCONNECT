import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUserId } from '../../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUserId() userId: string, @TenantId() tenantId: string, @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationsService.findAll(userId, tenantId, unreadOnly === 'true');
  }

  @Get('unread-count')
  getCount(@CurrentUserId() userId: string, @TenantId() tenantId: string) {
    return this.notificationsService.getUnreadCount(userId, tenantId);
  }

  @Post(':id/read')
  markRead(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.notificationsService.markRead(userId, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUserId() userId: string, @TenantId() tenantId: string) {
    return this.notificationsService.markAllRead(userId, tenantId);
  }
}
