import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { paginate, buildPaginatedResponse } from '../../common/utils/pagination';
import { CreateCampaignDto, UpdateCampaignDto } from './campaigns.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('campaigns') private readonly campaignQueue: Queue,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number; status?: string; search?: string }) {
    const { skip, take } = paginate(query);
    const where: any = { tenantId, ...(query.status && { status: query.status }), deletedAt: null };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          template: { select: { id: true, name: true, category: true } },
          phoneNumber: { select: { displayPhoneNumber: true, businessName: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return buildPaginatedResponse(campaigns, total, query);
  }

  async findOne(tenantId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        template: true,
        phoneNumber: { select: { id: true, displayPhoneNumber: true, businessName: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(tenantId: string, userId: string, dto: CreateCampaignDto) {
    // Validate template exists and is approved
    const template = await this.prisma.whatsAppTemplate.findFirst({
      where: { id: dto.templateId, tenantId },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.status !== 'APPROVED') {
      throw new BadRequestException('Only approved templates can be used for campaigns');
    }

    // Validate phone number
    const phoneNumber = await this.prisma.whatsAppPhoneNumber.findFirst({
      where: { phoneNumberId: dto.phoneNumberId, tenantId },
    });
    if (!phoneNumber) throw new NotFoundException('WhatsApp number not found');
    if (phoneNumber.status !== 'CONNECTED') {
      throw new BadRequestException('WhatsApp number is not connected');
    }

    return this.prisma.campaign.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        type: dto.type || 'IMMEDIATE',
        status: 'DRAFT',
        phoneNumberId: dto.phoneNumberId,
        templateId: dto.templateId,
        segmentIds: dto.segmentIds || [],
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        variables: dto.variables || {},
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        createdBy: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOne(tenantId, id);
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      throw new BadRequestException('Only draft or scheduled campaigns can be edited');
    }
    const { scheduledAt, ...rest } = dto;
    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      },
    });
  }

  async launch(tenantId: string, id: string, userId: string) {
    const campaign = await this.findOne(tenantId, id);
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      throw new BadRequestException(`Cannot launch campaign with status ${campaign.status}`);
    }

    // Get recipient count from segments
    const contactCount = await this.getSegmentContactCount(tenantId, campaign.segmentIds as string[]);
    if (contactCount === 0) {
      throw new BadRequestException('No contacts in selected audience segments');
    }

    // Update to processing
    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'PROCESSING', totalRecipients: contactCount, startedAt: new Date() },
    });

    // Queue campaign processing
    await this.campaignQueue.add('process', {
      campaignId: id,
      tenantId,
      launchedBy: userId,
    }, {
      priority: 5,
      attempts: 1,
    });

    this.logger.log(`Campaign ${id} queued for processing with ${contactCount} recipients`);
    return { message: 'Campaign queued for sending', recipientCount: contactCount };
  }

  async pause(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status !== 'RUNNING') {
      throw new BadRequestException('Only running campaigns can be paused');
    }
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED', pausedAt: new Date() },
    });
  }

  async cancel(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    if (['COMPLETED', 'CANCELLED'].includes(campaign.status)) {
      throw new BadRequestException('Campaign already completed or cancelled');
    }
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getStats(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    const recipients = await this.prisma.campaignRecipient.groupBy({
      by: ['status'],
      where: { campaignId: id },
      _count: true,
    });

    const stats: Record<string, number> = {};
    for (const r of recipients) {
      stats[r.status.toLowerCase()] = r._count;
    }

    return {
      ...campaign,
      stats: {
        total: campaign.totalRecipients,
        sent: stats['sent'] || 0,
        delivered: stats['delivered'] || 0,
        read: stats['read'] || 0,
        failed: stats['failed'] || 0,
        pending: stats['pending'] || 0,
        deliveryRate: campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0',
        readRate: campaign.deliveredCount > 0 ? ((campaign.readCount / campaign.deliveredCount) * 100).toFixed(1) : '0',
      },
    };
  }

  private async getSegmentContactCount(tenantId: string, segmentIds: string[]): Promise<number> {
    if (!segmentIds?.length) return 0;
    // Simplified: count distinct opted-in contacts in segments
    const segments = await this.prisma.audienceSegment.findMany({
      where: { id: { in: segmentIds }, tenantId },
    });
    // For now return sum of contact counts (proper implementation would evaluate segment conditions)
    return segments.reduce((sum, s) => sum + s.contactCount, 0);
  }
}
