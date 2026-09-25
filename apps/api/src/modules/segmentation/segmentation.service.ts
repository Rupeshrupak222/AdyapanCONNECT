import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SegmentationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.audienceSegment.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, createdBy: string, dto: { name: string; description?: string; conditions: any[]; conditionOperator?: string; isDynamic?: boolean }) {
    const segment = await this.prisma.audienceSegment.create({
      data: { tenantId, name: dto.name, description: dto.description, conditions: dto.conditions, conditionOperator: dto.conditionOperator || 'AND', isDynamic: dto.isDynamic ?? true, createdBy },
    });
    await this.refreshCount(segment.id, tenantId, dto.conditions, dto.conditionOperator || 'AND');
    return segment;
  }

  async refreshCount(segmentId: string, tenantId: string, conditions: any[], operator: string) {
    // Simplified count - in production this would evaluate conditions dynamically
    const count = await this.prisma.contact.count({ where: { tenantId, deletedAt: null, optStatus: 'OPTED_IN' } });
    await this.prisma.audienceSegment.update({ where: { id: segmentId }, data: { contactCount: count, lastRefreshedAt: new Date() } });
    return count;
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.audienceSegment.deleteMany({ where: { id, tenantId } });
  }
}
