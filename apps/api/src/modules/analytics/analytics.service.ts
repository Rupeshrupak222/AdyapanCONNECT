import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string, from?: Date, to?: Date) {
    const dateFilter = from && to ? { gte: from, lte: to } : undefined;
    const msgWhere: any = { tenantId, ...(dateFilter && { createdAt: dateFilter }) };

    const [
      totalMessages, sentMessages, deliveredMessages, readMessages, failedMessages,
      activeConversations, openLeads, campaigns,
    ] = await Promise.all([
      this.prisma.message.count({ where: msgWhere }),
      this.prisma.message.count({ where: { ...msgWhere, status: 'SENT' } }),
      this.prisma.message.count({ where: { ...msgWhere, status: 'DELIVERED' } }),
      this.prisma.message.count({ where: { ...msgWhere, status: 'READ' } }),
      this.prisma.message.count({ where: { ...msgWhere, status: 'FAILED' } }),
      this.prisma.conversation.count({ where: { tenantId, status: 'OPEN' } }),
      this.prisma.lead.count({ where: { tenantId, status: { not: 'CONVERTED' } } }),
      this.prisma.campaign.count({ where: { tenantId, status: 'COMPLETED', ...(dateFilter && { completedAt: dateFilter }) } }),
    ]);

    return {
      totalMessages,
      messagesSent: sentMessages,
      messagesDelivered: deliveredMessages,
      messagesRead: readMessages,
      messagesFailed: failedMessages,
      deliveryRate: sentMessages > 0 ? ((deliveredMessages / sentMessages) * 100).toFixed(1) : '0',
      readRate: deliveredMessages > 0 ? ((readMessages / deliveredMessages) * 100).toFixed(1) : '0',
      activeConversations,
      openLeads,
      campaignsCompleted: campaigns,
    };
  }

  async getMessageTrend(tenantId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const messages = await this.prisma.message.findMany({
      where: { tenantId, createdAt: { gte: from } },
      select: { status: true, direction: true, createdAt: true },
    });

    const byDay: Record<string, any> = {};
    for (const msg of messages) {
      const date = msg.createdAt.toISOString().split('T')[0];
      if (!byDay[date]) byDay[date] = { date, sent: 0, delivered: 0, read: 0, failed: 0, received: 0 };
      if (msg.direction === 'OUTBOUND') {
        if (msg.status === 'SENT') byDay[date].sent++;
        if (msg.status === 'DELIVERED') byDay[date].delivered++;
        if (msg.status === 'READ') byDay[date].read++;
        if (msg.status === 'FAILED') byDay[date].failed++;
      } else {
        byDay[date].received++;
      }
    }

    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCampaignAnalytics(tenantId: string, page = 1, pageSize = 10) {
    const campaigns = await this.prisma.campaign.findMany({
      where: { tenantId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true, name: true, sentCount: true, deliveredCount: true,
        readCount: true, failedCount: true, clickCount: true, actualCost: true, completedAt: true,
      },
    });

    return campaigns.map(c => ({
      ...c,
      deliveryRate: c.sentCount > 0 ? ((c.deliveredCount / c.sentCount) * 100).toFixed(1) : '0',
      readRate: c.deliveredCount > 0 ? ((c.readCount / c.deliveredCount) * 100).toFixed(1) : '0',
    }));
  }
}
