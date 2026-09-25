import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate, buildPaginatedResponse } from '../../common/utils/pagination';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: {
    page?: number; pageSize?: number; status?: string;
    assignedTo?: string; search?: string; label?: string;
    priority?: string; unreadOnly?: boolean;
  }) {
    const { skip, take } = paginate(query);
    const where: any = { tenantId, ...(query.status && { status: query.status }), ...(query.assignedTo && { assignedAgentId: query.assignedTo }), ...(query.priority && { priority: query.priority }), ...(query.unreadOnly && { unreadCount: { gt: 0 } }) };

    if (query.search) {
      where.OR = [
        { contact: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { contact: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { contact: { phoneNumber: { contains: query.search } } },
        { lastMessagePreview: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true, leadScore: true, tags: { include: { tag: true } } } },
          assignedAgent: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          phoneNumber: { select: { displayPhoneNumber: true, businessName: true } },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return buildPaginatedResponse(conversations, total, query);
  }

  async findOne(tenantId: string, id: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        assignedAgent: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
        phoneNumber: true,
        notes: { orderBy: { createdAt: 'desc' } },
        labels_: true,
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async assign(tenantId: string, id: string, agentId: string | null, assignedBy: string) {
    const conv = await this.prisma.conversation.findFirstOrThrow({ where: { id, tenantId } });

    await this.prisma.conversationAssignment.create({
      data: { conversationId: id, agentId: agentId || '', assignedBy },
    });

    return this.prisma.conversation.update({
      where: { id },
      data: { assignedAgentId: agentId },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.conversation.updateMany({
      where: { id, tenantId },
      data: {
        status: status as any,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
        ...(status === 'RESOLVED' && { unreadCount: 0 }),
      },
    });
  }

  async addLabel(tenantId: string, id: string, label: string, userId: string) {
    await this.prisma.conversation.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.conversationLabel.upsert({
      where: { conversationId_label: { conversationId: id, label } },
      create: { conversationId: id, label, addedBy: userId },
      update: {},
    });
  }

  async addNote(tenantId: string, id: string, content: string, createdBy: string, isInternal = true) {
    await this.prisma.conversation.findFirstOrThrow({ where: { id, tenantId } });
    return this.prisma.conversationNote.create({
      data: { conversationId: id, content, createdBy, isInternal },
    });
  }

  async markRead(tenantId: string, id: string) {
    return this.prisma.conversation.updateMany({
      where: { id, tenantId },
      data: { unreadCount: 0 },
    });
  }
}
