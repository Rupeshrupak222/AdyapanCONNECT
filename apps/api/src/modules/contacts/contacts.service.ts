import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate, buildPaginatedResponse } from '../../common/utils/pagination';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number; search?: string; tag?: string; optStatus?: string }) {
    const { skip, take } = paginate(query);
    const where: any = { tenantId, deletedAt: null };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.optStatus) where.optStatus = query.optStatus;
    if (query.tag) where.tags = { some: { tag: { name: query.tag } } };

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { tags: { include: { tag: true } } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return buildPaginatedResponse(contacts, total, query);
  }

  async findOne(tenantId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        tags: { include: { tag: true } },
        notes_: { orderBy: { createdAt: 'desc' } },
        conversations: { take: 5, orderBy: { lastMessageAt: 'desc' } },
        leads: { take: 5, orderBy: { createdAt: 'desc' } },
        deals: { take: 5, orderBy: { createdAt: 'desc' } },
        tasks: { where: { status: { not: 'DONE' } }, orderBy: { dueDate: 'asc' } },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async create(tenantId: string, dto: any) {
    const existing = await this.prisma.contact.findFirst({
      where: { tenantId, phoneNumber: dto.phoneNumber, deletedAt: null },
    });
    if (existing) throw new ConflictException('Contact with this phone number already exists');

    return this.prisma.contact.create({
      data: {
        tenantId,
        phoneNumber: dto.phoneNumber,
        countryCode: dto.countryCode || '+91',
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        company: dto.company,
        jobTitle: dto.jobTitle,
        source: dto.source,
        notes: dto.notes,
        customAttributes: dto.customAttributes || {},
        optStatus: dto.optStatus || 'UNKNOWN',
      },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.prisma.contact.findFirstOrThrow({ where: { id, tenantId, deletedAt: null } });
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async delete(tenantId: string, id: string) {
    await this.prisma.contact.findFirstOrThrow({ where: { id, tenantId, deletedAt: null } });
    return this.prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async addTag(tenantId: string, contactId: string, tagName: string) {
    await this.prisma.contact.findFirstOrThrow({ where: { id: contactId, tenantId } });
    const tag = await this.prisma.tag.upsert({
      where: { tenantId_name: { tenantId, name: tagName } },
      create: { tenantId, name: tagName },
      update: {},
    });
    return this.prisma.contactTag.upsert({
      where: { contactId_tagId: { contactId, tagId: tag.id } },
      create: { contactId, tagId: tag.id },
      update: {},
    });
  }

  async removeTag(tenantId: string, contactId: string, tagName: string) {
    await this.prisma.contact.findFirstOrThrow({ where: { id: contactId, tenantId } });
    const tag = await this.prisma.tag.findFirst({ where: { tenantId, name: tagName } });
    if (!tag) return;
    return this.prisma.contactTag.delete({
      where: { contactId_tagId: { contactId, tagId: tag.id } },
    });
  }

  async bulkImport(tenantId: string, contacts: any[]) {
    let created = 0; let skipped = 0; let failed = 0;

    for (const c of contacts) {
      try {
        await this.prisma.contact.upsert({
          where: { tenantId_phoneNumber: { tenantId, phoneNumber: c.phoneNumber } },
          create: { tenantId, phoneNumber: c.phoneNumber, firstName: c.firstName, lastName: c.lastName, email: c.email, company: c.company, source: c.source || 'import', customAttributes: c.customAttributes || {} },
          update: { firstName: c.firstName, lastName: c.lastName, email: c.email, company: c.company },
        });
        created++;
      } catch {
        failed++;
      }
    }

    return { created, skipped, failed, total: contacts.length };
  }
}
