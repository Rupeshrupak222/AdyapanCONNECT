import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { generateSigningSecret, createHmacSignature } from '../../common/utils/encryption';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhooks') private readonly webhookQueue: Queue,
  ) {}

  async create(tenantId: string, userId: string, dto: { name: string; url: string; events: string[] }) {
    return this.prisma.webhook.create({
      data: {
        tenantId,
        name: dto.name,
        url: dto.url,
        events: dto.events,
        signingSecret: generateSigningSecret(),
        createdBy: userId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.webhook.deleteMany({ where: { id, tenantId } });
  }

  async dispatch(tenantId: string, event: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { tenantId, isActive: true, events: { has: event } },
    });

    for (const webhook of webhooks) {
      await this.webhookQueue.add('deliver', {
        webhookId: webhook.id,
        url: webhook.url,
        secret: webhook.signingSecret,
        event,
        payload,
      }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
      });
    }
  }

  async getDeliveryLogs(tenantId: string, webhookId: string, page = 1, pageSize = 20) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id: webhookId, tenantId } });
    if (!webhook) return null;

    const [deliveries, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({
        where: { webhookId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.webhookDelivery.count({ where: { webhookId } }),
    ]);

    return { deliveries, total, page, pageSize };
  }
}
