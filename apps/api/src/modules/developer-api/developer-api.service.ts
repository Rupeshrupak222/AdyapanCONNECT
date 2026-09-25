import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { generateApiKey, hashApiKey } from '../../common/utils/encryption';

@Injectable()
export class DeveloperApiService {
  constructor(private readonly prisma: PrismaService) {}

  async createApiKey(tenantId: string, userId: string, dto: { name: string; permissions: string[]; expiresAt?: string }) {
    const { key, prefix } = generateApiKey();
    const keyHash = hashApiKey(key);

    await this.prisma.apiKey.create({
      data: {
        tenantId,
        userId,
        name: dto.name,
        keyHash,
        keyPrefix: prefix,
        permissions: dto.permissions,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    // Return full key ONLY once - never stored in plain text
    return { key, prefix, name: dto.name, message: 'Save this key - it will not be shown again' };
  }

  async listApiKeys(tenantId: string) {
    return this.prisma.apiKey.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, keyPrefix: true, permissions: true, lastUsedAt: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(tenantId: string, id: string) {
    return this.prisma.apiKey.updateMany({
      where: { id, tenantId },
      data: { isActive: false },
    });
  }

  async validateApiKey(key: string): Promise<{ tenantId: string; permissions: string[] } | null> {
    const keyHash = hashApiKey(key);
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { keyHash, isActive: true },
    });

    if (!apiKey) return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

    await this.prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
    return { tenantId: apiKey.tenantId, permissions: apiKey.permissions };
  }

  async getUsage(tenantId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.apiRequestLog.groupBy({
      by: ['statusCode'],
      where: { tenantId, createdAt: { gte: from } },
      _count: true,
    });
  }
}
