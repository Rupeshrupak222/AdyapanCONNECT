import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, tenantId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, tenantId, ...(unreadOnly && { isRead: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true, readAt: new Date() } });
  }

  async markAllRead(userId: string, tenantId: string) {
    return this.prisma.notification.updateMany({ where: { userId, tenantId, isRead: false }, data: { isRead: true, readAt: new Date() } });
  }

  async create(data: { tenantId: string; userId: string; type: any; title: string; message: string; data?: any }) {
    return this.prisma.notification.create({ data });
  }

  async getUnreadCount(userId: string, tenantId: string) {
    return this.prisma.notification.count({ where: { userId, tenantId, isRead: false } });
  }
}
