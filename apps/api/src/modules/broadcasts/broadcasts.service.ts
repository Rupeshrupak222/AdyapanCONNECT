import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BroadcastsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.campaign.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, name: true, status: true, totalRecipients: true, sentCount: true, deliveredCount: true, readCount: true, createdAt: true },
    });
  }
}
