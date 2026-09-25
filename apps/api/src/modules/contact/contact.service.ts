import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

type CreateContactInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source?: string;
};

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateContactInput) {
    const msg = await this.prisma.contactMessage.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        company: input.company,
        message: input.message,
        source: input.source || 'contact-page',
      },
    });
    this.logger.log(`New contact enquiry from ${input.email} (${msg.id})`);
    return { id: msg.id };
  }

  async list(q: { page?: number; pageSize?: number; status?: string; search?: string }) {
    const page = Number(q.page) || 1;
    const pageSize = Number(q.pageSize) || 20;
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.search) {
      where.OR = [
        { email: { contains: q.search, mode: 'insensitive' } },
        { firstName: { contains: q.search, mode: 'insensitive' } },
        { message: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async setStatus(id: string, status: 'NEW' | 'READ' | 'RESPONDED' | 'ARCHIVED') {
    return this.prisma.contactMessage.update({ where: { id }, data: { status }, select: { id: true, status: true } });
  }

  async unreadCount() {
    const count = await this.prisma.contactMessage.count({ where: { status: 'NEW' } });
    return { count };
  }
}
