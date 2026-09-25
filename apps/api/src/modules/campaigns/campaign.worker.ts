import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { decrypt } from '../../common/utils/encryption';

@Injectable()
@Processor('campaigns', { concurrency: 5 })
export class CampaignWorker extends WorkerHost {
  private readonly logger = new Logger(CampaignWorker.name);
  private readonly RATE_LIMIT_PER_SECOND = 80;
  private readonly BATCH_SIZE = 50;

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsAppService,
    @InjectQueue('messages') private readonly messageQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    const { campaignId, tenantId } = job.data;

    this.logger.log(`Processing campaign ${campaignId}`);

    const campaign = await this.prisma.campaign.findFirstOrThrow({
      where: { id: campaignId, tenantId },
      include: {
        template: true,
        phoneNumber: {
          select: { phoneNumberId: true, accessTokenEncrypted: true },
        },
      },
    });

    // Mark as running
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'RUNNING' },
    });

    // Get contacts from segments
    const contacts = await this.getContactsFromSegments(tenantId, campaign.segmentIds as string[]);

    // Create recipient records in bulk
    const existingRecipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId },
      select: { contactId: true },
    });
    const existingIds = new Set(existingRecipients.map(r => r.contactId));

    const newRecipients = contacts
      .filter(c => !existingIds.has(c.id))
      .map(c => ({ campaignId, contactId: c.id, status: 'PENDING' as const }));

    if (newRecipients.length > 0) {
      await this.prisma.campaignRecipient.createMany({ data: newRecipients });
    }

    // Process in batches with rate limiting
    const allPendingRecipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId, status: 'PENDING' },
      include: { contact: { select: { id: true, phoneNumber: true, firstName: true, lastName: true, customAttributes: true } } },
    });

    const accessToken = decrypt(campaign.phoneNumber.accessTokenEncrypted!);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allPendingRecipients.length; i += this.BATCH_SIZE) {
      // Check if campaign is still running (not paused/cancelled)
      const currentCampaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { status: true },
      });

      if (currentCampaign?.status === 'PAUSED') {
        this.logger.log(`Campaign ${campaignId} paused at recipient ${i}`);
        return;
      }
      if (currentCampaign?.status === 'CANCELLED') {
        this.logger.log(`Campaign ${campaignId} cancelled at recipient ${i}`);
        return;
      }

      const batch = allPendingRecipients.slice(i, i + this.BATCH_SIZE);

      for (const recipient of batch) {
        try {
          // Build personalized components
          const components = this.buildTemplateComponents(campaign.template, recipient.contact, campaign.variables as any);

          const result = await this.whatsapp.sendTemplateMessage(
            campaign.phoneNumber.phoneNumberId,
            accessToken,
            recipient.contact.phoneNumber,
            campaign.template.name,
            campaign.template.language,
            components,
          );

          await this.prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'SENT', messageId: result.messageId, sentAt: new Date() },
          });

          successCount++;

          // Rate limiting - stay under Meta's limit
          await this.sleep(1000 / this.RATE_LIMIT_PER_SECOND);
        } catch (error: any) {
          this.logger.warn(`Failed to send to ${recipient.contact.phoneNumber}: ${error.message}`);
          await this.prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: 'FAILED', failedAt: new Date(), failureReason: error.message },
          });
          failCount++;
        }
      }

      // Update campaign stats after each batch
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount: successCount, failedCount: failCount },
      });
    }

    // Mark campaign as completed
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        sentCount: successCount,
        failedCount: failCount,
      },
    });

    this.logger.log(`Campaign ${campaignId} completed. Sent: ${successCount}, Failed: ${failCount}`);
  }

  private buildTemplateComponents(template: any, contact: any, variables: Record<string, string>): any[] {
    const components: any[] = [];

    if (template.headerType && template.headerContent) {
      if (template.headerType === 'TEXT') {
        components.push({
          type: 'header',
          parameters: [{ type: 'text', text: template.headerContent }],
        });
      } else {
        components.push({
          type: 'header',
          parameters: [{ type: template.headerType.toLowerCase(), [template.headerType.toLowerCase()]: { link: template.headerContent } }],
        });
      }
    }

    // Personalize body variables
    if (template.bodyVariables?.length > 0) {
      const bodyParams = template.bodyVariables.map((varName: string) => ({
        type: 'text',
        text: this.resolveVariable(varName, contact, variables),
      }));
      components.push({ type: 'body', parameters: bodyParams });
    }

    return components;
  }

  private resolveVariable(varName: string, contact: any, variables: Record<string, string>): string {
    const map: Record<string, any> = {
      name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phoneNumber,
      first_name: contact.firstName || '',
      last_name: contact.lastName || '',
      phone: contact.phoneNumber,
      ...variables,
      ...(contact.customAttributes as any || {}),
    };
    return map[varName] || varName;
  }

  private async getContactsFromSegments(tenantId: string, segmentIds: string[]) {
    // Get all opted-in contacts from the tenant (in a real implementation, evaluate segment conditions)
    return this.prisma.contact.findMany({
      where: {
        tenantId,
        optStatus: 'OPTED_IN',
        deletedAt: null,
      },
      select: { id: true, phoneNumber: true, firstName: true, lastName: true, customAttributes: true },
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Campaign job ${job.id} failed: ${error.message}`);
    this.prisma.campaign.update({
      where: { id: job.data.campaignId },
      data: { status: 'FAILED' },
    }).catch(() => {});
  }
}
