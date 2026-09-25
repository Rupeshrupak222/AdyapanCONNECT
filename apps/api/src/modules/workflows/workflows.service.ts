import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.workflow.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, createdBy: string, dto: any) {
    return this.prisma.workflow.create({ data: { tenantId, createdBy, name: dto.name, description: dto.description, trigger: dto.trigger, nodes: dto.nodes || [], edges: dto.edges || [], status: 'DRAFT' } });
  }

  async update(tenantId: string, id: string, dto: any) {
    return this.prisma.workflow.updateMany({ where: { id, tenantId }, data: dto });
  }

  async toggle(tenantId: string, id: string, active: boolean) {
    return this.prisma.workflow.updateMany({ where: { id, tenantId }, data: { status: active ? 'ACTIVE' : 'INACTIVE' } });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.workflow.updateMany({ where: { id, tenantId }, data: { deletedAt: new Date() } });
  }
}
