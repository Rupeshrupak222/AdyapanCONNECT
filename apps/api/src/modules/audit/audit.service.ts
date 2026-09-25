import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: { tenantId: string; userId?: string; action: string; resource: string; resourceId?: string; ipAddress?: string; userAgent?: string; before?: any; after?: any; metadata?: any }) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll(tenantId: string, query: { page?: number; pageSize?: number; action?: string; resource?: string }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const where: any = { tenantId, ...(query.action && { action: { contains: query.action } }), ...(query.resource && { resource: query.resource }) };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items: logs, total, page, pageSize };
  }
}
