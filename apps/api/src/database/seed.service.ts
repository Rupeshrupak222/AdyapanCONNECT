import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from './prisma.service';

/**
 * Seeds a platform super-admin on boot (idempotent). Reads SUPER_ADMIN_EMAIL and
 * SUPER_ADMIN_PASSWORD from the environment. Runs once; skips if the admin exists.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.seedSuperAdmin();
    } catch (err: any) {
      // Never let seeding crash the app — just log it.
      this.logger.error(`Super-admin seeding failed: ${err?.message || err}`);
    }
    try {
      await this.seedPlans();
    } catch (err: any) {
      this.logger.error(`Plan seeding failed: ${err?.message || err}`);
    }
  }

  private async seedPlans() {
    const count = await this.prisma.plan.count();
    if (count > 0) {
      this.logger.log(`Plans already seeded (${count}) — skipping.`);
      return;
    }

    const plans = [
      {
        name: 'Starter', tier: 'STARTER' as const, priceMonthly: 0, priceAnnual: 0, sortOrder: 1,
        limitsJson: { contacts: 500, messagesPerMonth: 1000, teamMembers: 2, campaigns: 5 },
        featuresJson: ['1 WhatsApp number', 'Team inbox', 'Basic templates', 'Email support'],
      },
      {
        name: 'Growth', tier: 'GROWTH' as const, priceMonthly: 1999, priceAnnual: 19990, sortOrder: 2,
        limitsJson: { contacts: 10000, messagesPerMonth: 25000, teamMembers: 10, campaigns: 100 },
        featuresJson: ['3 WhatsApp numbers', 'AI Agent & Chatbots', 'Campaigns & broadcasts', 'CRM', 'Priority support'],
      },
      {
        name: 'Business', tier: 'BUSINESS' as const, priceMonthly: 4999, priceAnnual: 49990, sortOrder: 3,
        limitsJson: { contacts: 50000, messagesPerMonth: 100000, teamMembers: 25, campaigns: 500 },
        featuresJson: ['10 WhatsApp numbers', 'Advanced automation', 'Workflows & flows', 'API access', 'Dedicated manager'],
      },
      {
        name: 'Enterprise', tier: 'ENTERPRISE' as const, priceMonthly: 14999, priceAnnual: 149990, sortOrder: 4,
        limitsJson: { contacts: -1, messagesPerMonth: -1, teamMembers: -1, campaigns: -1 },
        featuresJson: ['Unlimited numbers', 'White-label', 'Custom integrations', 'SLA & 24/7 support', 'On-premise option'],
      },
    ];

    for (const p of plans) {
      await this.prisma.plan.create({
        data: { ...p, currency: 'INR', isActive: true, isPublic: true },
      });
    }
    this.logger.log(`Seeded ${plans.length} billing plans.`);
  }

  private async seedSuperAdmin() {
    const email = (this.config.get<string>('SUPER_ADMIN_EMAIL') || '').toLowerCase().trim();
    const password = this.config.get<string>('SUPER_ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set — skipping super-admin seed.');
      return;
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      this.logger.log(`Super-admin already exists (${email}) — skipping seed.`);
      return;
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: 'Super',
          lastName: 'Admin',
          status: 'ACTIVE',
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // A dedicated platform tenant + SUPER_ADMIN role so the admin has a workspace context.
      const tenant = await tx.tenant.create({
        data: {
          name: 'Adyapan Platform',
          slug: 'platform',
          status: 'ACTIVE',
        },
      });

      const role = await tx.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Platform super administrator',
          isSystem: true,
          isDefault: false,
          tenantId: tenant.id,
        },
      });

      await tx.tenantMember.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
          isActive: true,
          joinedAt: new Date(),
        },
      });

      await tx.creditWallet.create({
        data: { tenantId: tenant.id, balance: 0, currency: 'INR' },
      });
    });

    this.logger.log(`Super-admin created: ${email}`);
  }
}
