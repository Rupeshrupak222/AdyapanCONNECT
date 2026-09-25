import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, uploadedBy: string, data: { url: string; key: string; type: string; mimeType?: string; size?: number; name?: string }) {
    return this.prisma.media.create({ data: { tenantId, uploadedBy, ...data } });
  }

  async findAll(tenantId: string) {
    return this.prisma.media.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}
