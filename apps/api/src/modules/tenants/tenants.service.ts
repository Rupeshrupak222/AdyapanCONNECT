import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { subscription: { include: { plan: true } }, wallet: true, settings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: any) {
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async getMembers(tenantId: string) {
    return this.prisma.tenantMember.findMany({
      where: { tenantId, isActive: true },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, lastLoginAt: true } }, role: { select: { name: true } } },
    });
  }

  async inviteMember(tenantId: string, email: string, roleId: string, invitedBy: string) {
    // Find or create user
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({ data: { email, firstName: email.split('@')[0], lastName: '', status: 'PENDING' } });
    }
    return this.prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId, userId: user.id } },
      create: { tenantId, userId: user.id, roleId, isActive: false, invitedBy, invitedAt: new Date() },
      update: { roleId, isActive: false, invitedAt: new Date() },
    });
  }

  async removeMember(tenantId: string, userId: string) {
    return this.prisma.tenantMember.updateMany({
      where: { tenantId, userId }, data: { isActive: false },
    });
  }

  async getStats(tenantId: string) {
    const [contacts, conversations, campaigns, members] = await Promise.all([
      this.prisma.contact.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.conversation.count({ where: { tenantId } }),
      this.prisma.campaign.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.tenantMember.count({ where: { tenantId, isActive: true } }),
    ]);
    return { contacts, conversations, campaigns, members };
  }
}
