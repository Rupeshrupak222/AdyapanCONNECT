import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: MessagesGateway,
    @InjectQueue('messages') private readonly messageQueue: Queue,
  ) {}

  async sendMessage(tenantId: string, dto: {
    conversationId: string;
    type: string;
    content?: string;
    mediaUrl?: string;
    templateId?: string;
    templateData?: any;
    interactiveData?: any;
    replyToId?: string;
    sentById: string;
  }) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id: dto.conversationId, tenantId },
      include: { contact: true, phoneNumber: true },
    });

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        tenantId,
        direction: 'OUTBOUND',
        type: dto.type as any,
        status: 'QUEUED',
        content: dto.content,
        mediaUrl: dto.mediaUrl,
        templateId: dto.templateId,
        templateData: dto.templateData,
        interactiveData: dto.interactiveData,
        replyToId: dto.replyToId,
        sentById: dto.sentById,
      },
    });

    // Queue for sending
    await this.messageQueue.add('send', {
      messageId: message.id,
      tenantId,
      phoneNumberId: conversation.phoneNumber.phoneNumberId,
      to: conversation.contact.phoneNumber,
      type: dto.type,
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      templateData: dto.templateData,
      interactiveData: dto.interactiveData,
    }, {
      priority: 10,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { lastMessageAt: new Date(), lastMessagePreview: dto.content?.substring(0, 100) },
    });

    // Emit real-time event
    this.gateway.emitToTenant(tenantId, 'new_message', message);

    return message;
  }

  async getConversationMessages(tenantId: string, conversationId: string, page = 1, pageSize = 50) {
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId, tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          sentBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          attachments: true,
          reactions: true,
          replyTo: { select: { id: true, content: true, type: true } },
        },
      }),
      this.prisma.message.count({ where: { conversationId, tenantId } }),
    ]);

    return { messages: messages.reverse(), total, page, pageSize };
  }

  async processIncomingWebhookMessage(phoneNumberId: string, webhookMessage: any, contact?: any) {
    try {
      // Find phone number in our DB
      const phoneNumber = await this.prisma.whatsAppPhoneNumber.findUnique({
        where: { phoneNumberId },
        select: { tenantId: true, phoneNumberId: true },
      });

      if (!phoneNumber) {
        this.logger.warn(`Phone number ${phoneNumberId} not found in database`);
        return;
      }

      const { tenantId } = phoneNumber;
      const from = webhookMessage.from;
      const contactName = contact?.profile?.name;

      // Upsert contact
      const dbContact = await this.prisma.contact.upsert({
        where: { tenantId_phoneNumber: { tenantId, phoneNumber: from } },
        create: {
          tenantId,
          phoneNumber: from,
          countryCode: '+' + from.substring(0, 2),
          firstName: contactName?.split(' ')[0],
          lastName: contactName?.split(' ').slice(1).join(' '),
          lastInteractionAt: new Date(),
        },
        update: {
          lastInteractionAt: new Date(),
          ...(contactName && {
            firstName: contactName.split(' ')[0],
            lastName: contactName.split(' ').slice(1).join(' '),
          }),
        },
      });

      // Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          tenantId,
          phoneNumberId,
          contactId: dbContact.id,
          status: { not: 'RESOLVED' },
        },
      });

      const messageContent = this.extractMessageContent(webhookMessage);

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            tenantId,
            phoneNumberId,
            contactId: dbContact.id,
            status: 'OPEN',
            lastMessageAt: new Date(),
            lastMessagePreview: messageContent?.substring(0, 100),
            unreadCount: 1,
          },
        });
      } else {
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            status: 'OPEN',
            lastMessageAt: new Date(),
            lastMessagePreview: messageContent?.substring(0, 100),
            unreadCount: { increment: 1 },
          },
        });
      }

      // Store message
      const message = await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          tenantId,
          externalId: webhookMessage.id,
          direction: 'INBOUND',
          type: webhookMessage.type?.toUpperCase() as any || 'TEXT',
          status: 'DELIVERED',
          content: messageContent,
          deliveredAt: new Date(parseInt(webhookMessage.timestamp) * 1000),
        },
      });

      // Emit real-time events
      this.gateway.emitToTenant(tenantId, 'new_message', {
        conversationId: conversation.id,
        message,
      });

      this.gateway.emitToTenant(tenantId, 'conversation_updated', {
        conversationId: conversation.id,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: (conversation.unreadCount || 0) + 1,
      });

      return message;
    } catch (error) {
      this.logger.error('Error processing incoming message:', error);
      throw error;
    }
  }

  async processStatusUpdate(status: any) {
    try {
      const message = await this.prisma.message.findFirst({
        where: { externalId: status.id },
      });

      if (!message) return;

      const statusMap: Record<string, string> = {
        sent: 'SENT',
        delivered: 'DELIVERED',
        read: 'READ',
        failed: 'FAILED',
      };

      const newStatus = statusMap[status.status];
      if (!newStatus) return;

      const updateData: any = { status: newStatus };
      const ts = new Date(parseInt(status.timestamp) * 1000);

      if (status.status === 'sent') updateData.sentAt = ts;
      if (status.status === 'delivered') updateData.deliveredAt = ts;
      if (status.status === 'read') updateData.readAt = ts;
      if (status.status === 'failed') {
        updateData.failedAt = ts;
        updateData.failureReason = status.errors?.[0]?.title;
        updateData.failureCode = String(status.errors?.[0]?.code || '');
      }

      await this.prisma.message.update({
        where: { id: message.id },
        data: updateData,
      });

      // Emit status update
      this.gateway.emitToConversation(message.conversationId, 'message_status', {
        messageId: message.id,
        externalId: status.id,
        status: newStatus,
      });
    } catch (error) {
      this.logger.error('Error processing status update:', error);
    }
  }

  private extractMessageContent(message: any): string | undefined {
    switch (message.type) {
      case 'text': return message.text?.body;
      case 'image': return message.image?.caption || '[Image]';
      case 'video': return message.video?.caption || '[Video]';
      case 'audio': return '[Audio]';
      case 'document': return message.document?.caption || `[Document: ${message.document?.filename || 'file'}]`;
      case 'location': return `[Location: ${message.location?.name || 'Shared location'}]`;
      case 'interactive':
        if (message.interactive?.type === 'button_reply') return message.interactive.button_reply?.title;
        if (message.interactive?.type === 'list_reply') return message.interactive.list_reply?.title;
        return '[Interactive]';
      default: return `[${message.type}]`;
    }
  }
}
