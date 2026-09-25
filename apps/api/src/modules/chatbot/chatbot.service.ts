import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChatbotService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.chatbot.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: 'desc' }, include: { flows: { select: { id: true, name: true, isDefault: true, version: true } } } });
  }

  async create(tenantId: string, createdBy: string, dto: any) {
    return this.prisma.chatbot.create({ data: { tenantId, createdBy, name: dto.name, description: dto.description, trigger: dto.trigger || {}, flow: dto.flow || {} } });
  }

  async update(tenantId: string, id: string, dto: any) {
    return this.prisma.chatbot.updateMany({ where: { id, tenantId }, data: dto });
  }

  async saveFlow(tenantId: string, chatbotId: string, dto: { nodes: any[]; edges: any[]; name?: string }) {
    await this.prisma.chatbot.findFirstOrThrow({ where: { id: chatbotId, tenantId } });
    return this.prisma.chatbotFlow.upsert({
      where: { chatbotId_isDefault_name: { chatbotId, isDefault: true, name: dto.name || 'Main Flow' } } as any,
      create: { chatbotId, name: dto.name || 'Main Flow', isDefault: true, nodes: dto.nodes, edges: dto.edges },
      update: { nodes: dto.nodes, edges: dto.edges, version: { increment: 1 } },
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.chatbot.updateMany({ where: { id, tenantId }, data: { deletedAt: new Date(), isActive: false } });
  }
}
