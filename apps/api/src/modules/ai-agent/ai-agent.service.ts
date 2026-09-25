import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && !apiKey.includes('placeholder')) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Send a test message to an agent and get a real AI reply using its
   * configured model, system prompt, personality and temperature.
   */
  async testAgent(tenantId: string, id: string, message: string) {
    if (!this.openai) {
      throw new BadRequestException('OpenAI is not configured. Set OPENAI_API_KEY in the API environment.');
    }
    const agent = await this.prisma.aIAgent.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!agent) throw new NotFoundException('Agent not found');

    const systemParts = [
      agent.systemPrompt || `You are ${agent.name}, a helpful WhatsApp business assistant.`,
      agent.personality ? `Personality: ${agent.personality}` : '',
      agent.description ? `Role: ${agent.description}` : '',
    ].filter(Boolean);

    try {
      const completion = await this.openai.chat.completions.create({
        model: agent.model || 'gpt-4o-mini',
        temperature: agent.temperature ?? 0.7,
        max_tokens: Math.min(agent.maxResponseLength ?? 500, 1000),
        messages: [
          { role: 'system', content: systemParts.join('\n') },
          { role: 'user', content: message },
        ],
      });
      const reply = completion.choices[0]?.message?.content?.trim()
        || agent.fallbackMessage
        || "Sorry, I couldn't generate a response.";
      return { reply, model: agent.model };
    } catch (err: any) {
      this.logger.error(`OpenAI test failed: ${err?.message}`);
      throw new BadRequestException(err?.message || 'AI request failed. Check your OpenAI key/credits.');
    }
  }

  async findAll(tenantId: string) {
    return this.prisma.aIAgent.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, createdBy: string, dto: any) {
    return this.prisma.aIAgent.create({
      data: { tenantId, createdBy, name: dto.name, description: dto.description, personality: dto.personality, systemPrompt: dto.systemPrompt, model: dto.model || 'gpt-4-turbo-preview', temperature: dto.temperature ?? 0.7, maxResponseLength: dto.maxResponseLength ?? 1000, knowledgeBaseIds: dto.knowledgeBaseIds || [], allowedTools: dto.allowedTools || [], businessHours: dto.businessHours, fallbackMessage: dto.fallbackMessage, humanHandoffEnabled: dto.humanHandoffEnabled ?? true },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    return this.prisma.aIAgent.updateMany({ where: { id, tenantId }, data: dto });
  }

  async getKnowledgeBases(tenantId: string) {
    return this.prisma.knowledgeBase.findMany({ where: { tenantId }, include: { documents: { select: { id: true, title: true, type: true, status: true, chunkCount: true } } } });
  }

  async createKnowledgeBase(tenantId: string, createdBy: string, dto: { name: string; description?: string }) {
    return this.prisma.knowledgeBase.create({ data: { tenantId, createdBy, name: dto.name, description: dto.description } });
  }

  async addDocument(tenantId: string, knowledgeBaseId: string, dto: { title: string; type: string; content?: string; sourceUrl?: string }) {
    await this.prisma.knowledgeBase.findFirstOrThrow({ where: { id: knowledgeBaseId, tenantId } });
    return this.prisma.knowledgeDocument.create({
      data: { knowledgeBaseId, title: dto.title, type: dto.type as any, content: dto.content, sourceUrl: dto.sourceUrl, status: 'PENDING' },
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.aIAgent.updateMany({ where: { id, tenantId }, data: { deletedAt: new Date(), isActive: false } });
  }
}
