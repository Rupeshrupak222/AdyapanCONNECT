import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { decrypt } from '../../common/utils/encryption';

/**
 * Consumes the 'messages' queue and actually delivers outbound messages
 * through the Meta Cloud API, then updates the message row status.
 */
@Injectable()
@Processor('messages', { concurrency: 10 })
export class MessageWorker extends WorkerHost {
  private readonly logger = new Logger(MessageWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
  ) {
    super();
  }

  async process(job: Job) {
    const { messageId, phoneNumberId, to, type, content, mediaUrl, templateData } = job.data;

    // Resolve the stored (encrypted) access token for this number.
    const phone = await this.prisma.whatsAppPhoneNumber.findUnique({
      where: { phoneNumberId },
      select: { accessTokenEncrypted: true, status: true },
    });

    if (!phone?.accessTokenEncrypted) {
      await this.fail(messageId, 'This WhatsApp number is not fully connected (no access token). Connect a real number to send.');
      return;
    }

    const token = decrypt(phone.accessTokenEncrypted);

    try {
      let result: { messageId: string };

      if (type === 'TEXT' || type === 'text') {
        result = await this.whatsapp.sendTextMessage(phoneNumberId, token, to, content || '');
      } else if (type === 'TEMPLATE' || type === 'template') {
        result = await this.whatsapp.sendTemplateMessage(
          phoneNumberId, token, to,
          templateData?.name, templateData?.language || 'en', templateData?.components,
        );
      } else if (['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'image', 'video', 'audio', 'document'].includes(type)) {
        result = await this.whatsapp.sendMediaMessage(
          phoneNumberId, token, to,
          type.toLowerCase() as any, mediaUrl, content,
        );
      } else {
        // default to text
        result = await this.whatsapp.sendTextMessage(phoneNumberId, token, to, content || '');
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: 'SENT', externalId: result.messageId, sentAt: new Date() },
      });
      this.logger.log(`Message ${messageId} sent (wamid ${result.messageId})`);
    } catch (error: any) {
      await this.fail(messageId, error?.message || 'Send failed');
      throw error; // let BullMQ retry per job options
    }
  }

  private async fail(messageId: string, reason: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: { status: 'FAILED', failedAt: new Date(), failureReason: reason.slice(0, 250) },
    }).catch(() => {});
    this.logger.warn(`Message ${messageId} failed: ${reason}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Message job ${job.id} failed: ${error.message}`);
  }
}
