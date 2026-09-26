import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate, buildPaginatedResponse } from '../../common/utils/pagination';
import {
  CreateLeadDto, UpdateLeadDto, CreateDealDto, UpdateDealDto,
  CreatePipelineDto, CreateTaskDto, UpdateTaskDto,
} from './crm.dto';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Leads ───────────────────────────────────────────────────────────────────
  async getLeads(tenantId: string, q: { page?: number; pageSize?: number; status?: string; search?: string }) {
    const { skip, take } = paginate(q);
    const where: any = { tenantId, ...(q.status && { status: q.status }) };
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: 'insensitive' } },
        { contact: { firstName: { contains: q.search, mode: 'insensitive' } } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { contact: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } }, owner: { select: { id: true, firstName: true, lastName: true } } } }),
      this.prisma.lead.count({ where }),
    ]);
    return buildPaginatedResponse(items, total, q);
  }

  async createLead(tenantId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: { tenantId, ...dto } });
  }

  async updateLead(tenantId: string, id: string, dto: UpdateLeadDto) {
    return this.prisma.lead.updateMany({ where: { id, tenantId }, data: dto });
  }

  // ─── Deals ───────────────────────────────────────────────────────────────────
  async getDeals(tenantId: string, pipelineId?: string) {
    return this.prisma.deal.findMany({
      where: { tenantId, ...(pipelineId && { pipelineId }) },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } },
        stage: true,
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async createDeal(tenantId: string, dto: CreateDealDto) {
    return this.prisma.deal.create({ data: { tenantId, ...dto } });
  }

  async updateDeal(tenantId: string, id: string, dto: UpdateDealDto) {
    return this.prisma.deal.updateMany({ where: { id, tenantId }, data: dto });
  }

  // ─── Pipelines ───────────────────────────────────────────────────────────────
  async getPipelines(tenantId: string) {
    return this.prisma.pipeline.findMany({
      where: { tenantId },
      include: { stages: { orderBy: { order: 'asc' } }, _count: { select: { deals: true } } },
    });
  }

  async createPipeline(tenantId: string, dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        tenantId,
        name: dto.name,
        stages: { create: dto.stages },
      },
      include: { stages: true },
    });
  }

  // ─── Tasks ───────────────────────────────────────────────────────────────────
  async getTasks(tenantId: string, q: { page?: number; pageSize?: number; status?: string; assignedTo?: string }) {
    const { skip, take } = paginate(q);
    const where: any = { tenantId, ...(q.status && { status: q.status }), ...(q.assignedTo && { assignedTo: q.assignedTo }) };
    const [items, total] = await Promise.all([
      this.prisma.task.findMany({ where, skip, take, orderBy: { dueDate: 'asc' }, include: { assignee: { select: { id: true, firstName: true, lastName: true } }, contact: { select: { id: true, firstName: true, lastName: true } } } }),
      this.prisma.task.count({ where }),
    ]);
    return buildPaginatedResponse(items, total, q);
  }

  async createTask(tenantId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({ data: { tenantId, ...dto } });
  }

  async updateTask(tenantId: string, id: string, dto: UpdateTaskDto) {
    return this.prisma.task.updateMany({ where: { id, tenantId }, data: dto });
  }
}
