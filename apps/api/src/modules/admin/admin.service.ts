import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats() {
    const [tenants, users, messages, campaigns, activeSubscriptions] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.message.count(),
      this.prisma.campaign.count(),
      this.prisma.subscription.count({ where: { status: { in: ['ACTIVE', 'TRIALING'] } } }),
    ]);
    return { tenants, users, messages, campaigns, activeSubscriptions };
  }

  /**
   * One-shot, richly detailed platform overview for the admin dashboard.
   */
  async getOverview() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      tenants,
      users,
      messages,
      campaigns,
      contacts,
      templates,
      // tenant status split
      activeTenants,
      trialTenants,
      suspendedTenants,
      // user status split
      activeUsers,
      pendingUsers,
      verifiedUsers,
      // subscriptions
      paidSubscriptions,
      trialingSubscriptions,
      // messages last 30 / prev 30 for growth
      messages30,
      messagesPrev30,
      // new signups
      newUsers30,
      newUsersPrev30,
      newTenants30,
      // revenue
      revenueAgg,
      revenue30Agg,
      // message status breakdown
      messageStatus,
      // recent
      recentTenants,
      recentUsers,
      // plan breakdown
      subsByPlan,
      plans,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.message.count(),
      this.prisma.campaign.count(),
      this.prisma.contact.count(),
      this.prisma.whatsAppTemplate.count(),

      this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      this.prisma.tenant.count({ where: { status: 'TRIAL' } }),
      this.prisma.tenant.count({ where: { status: 'SUSPENDED' } }),

      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { emailVerified: true } }),

      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'TRIALING' } }),

      this.prisma.message.count({ where: { createdAt: { gte: last30 } } }),
      this.prisma.message.count({ where: { createdAt: { gte: prev30, lt: last30 } } }),

      this.prisma.user.count({ where: { createdAt: { gte: last30 } } }),
      this.prisma.user.count({ where: { createdAt: { gte: prev30, lt: last30 } } }),
      this.prisma.tenant.count({ where: { createdAt: { gte: last30 } } }),

      this.prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      this.prisma.invoice.aggregate({ where: { status: 'PAID', createdAt: { gte: last30 } }, _sum: { total: true } }),

      this.prisma.message.groupBy({ by: ['status'], _count: true }),

      this.prisma.tenant.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, slug: true, status: true, createdAt: true, _count: { select: { members: true } } },
      }),
      this.prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, firstName: true, lastName: true, email: true, status: true, emailVerified: true, createdAt: true },
      }),

      this.prisma.subscription.groupBy({ by: ['planId'], _count: true, where: { status: { in: ['ACTIVE', 'TRIALING'] } } }),
      this.prisma.plan.findMany({ select: { id: true, name: true, tier: true } }),
    ]);

    const pct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const planMap = new Map(plans.map((p) => [p.id, p]));
    const planBreakdown = subsByPlan.map((s) => ({
      planId: s.planId,
      planName: planMap.get(s.planId)?.name || 'Unknown',
      tier: planMap.get(s.planId)?.tier || '—',
      count: s._count,
    }));

    return {
      totals: {
        tenants,
        users,
        messages,
        campaigns,
        contacts,
        templates,
        paidSubscriptions,
        trialingSubscriptions,
        premiumTenants: paidSubscriptions,
      },
      tenantStatus: { active: activeTenants, trial: trialTenants, suspended: suspendedTenants },
      userStatus: { active: activeUsers, pending: pendingUsers, verified: verifiedUsers },
      growth: {
        messages: { current: messages30, previous: messagesPrev30, changePct: pct(messages30, messagesPrev30) },
        users: { current: newUsers30, previous: newUsersPrev30, changePct: pct(newUsers30, newUsersPrev30) },
        newTenants30,
      },
      revenue: {
        total: revenueAgg._sum.total || 0,
        last30Days: revenue30Agg._sum.total || 0,
      },
      messageStatus: messageStatus.map((m) => ({ status: m.status, count: m._count })),
      planBreakdown,
      recentTenants,
      recentUsers,
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, displayName: true, email: true,
        phoneNumber: true, avatarUrl: true, status: true, emailVerified: true,
        emailVerifiedAt: true, twoFactorEnabled: true, source: true,
        lastLoginAt: true, loginAttempts: true, createdAt: true, updatedAt: true,
        tenantMemberships: {
          select: {
            isActive: true,
            joinedAt: true,
            tenant: { select: { id: true, name: true, slug: true, status: true } },
            role: { select: { name: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status,
        // Unlock the account when re-activating.
        ...(status === 'ACTIVE' ? { lockedUntil: null, loginAttempts: 0 } : {}),
      },
      select: { id: true, status: true },
    });
    // Suspending? kill all active sessions so they can't keep using the app.
    if (status === 'SUSPENDED') {
      await this.prisma.userSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return updated;
  }

  async getUsers(q: { page?: number; pageSize?: number; search?: string }) {
    const page = Number(q.page) || 1;
    const pageSize = Number(q.pageSize) || 20;
    const where: any = {};
    if (q.search) {
      where.OR = [
        { email: { contains: q.search, mode: 'insensitive' } },
        { firstName: { contains: q.search, mode: 'insensitive' } },
        { lastName: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, email: true, status: true,
          emailVerified: true, createdAt: true, lastLoginAt: true, phoneNumber: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getTenants(q: { page?: number; pageSize?: number; search?: string; status?: string }) {
    const page = Number(q.page) || 1;
    const pageSize = Number(q.pageSize) || 20;
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.search) where.OR = [{ name: { contains: q.search, mode: 'insensitive' } }, { slug: { contains: q.search } }];

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' }, include: { subscription: { include: { plan: true } }, _count: { select: { members: true, contacts: true, campaigns: true } } } }),
      this.prisma.tenant.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async getTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        members: {
          take: 20,
          orderBy: { joinedAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, status: true } },
            role: { select: { name: true } },
          },
        },
        _count: { select: { members: true, contacts: true, campaigns: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Extra rollups
    const [messages, templates, wallet] = await Promise.all([
      this.prisma.message.count({ where: { tenantId: id } }),
      this.prisma.whatsAppTemplate.count({ where: { tenantId: id } }),
      this.prisma.creditWallet.findUnique({ where: { tenantId: id }, select: { balance: true, currency: true } }),
    ]);

    return { ...tenant, stats: { messages, templates } , wallet };
  }

  async suspendTenant(id: string) {
    return this.prisma.tenant.update({ where: { id }, data: { status: 'SUSPENDED' } });
  }

  async activateTenant(id: string) {
    return this.prisma.tenant.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async getMessageVolume(days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.message.groupBy({
      by: ['status'],
      where: { createdAt: { gte: from } },
      _count: true,
    });
  }

  async getRevenue() {
    const result = await this.prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { total: true },
    });
    return { totalRevenue: result._sum.total || 0 };
  }
}
