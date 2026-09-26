import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';

// Razorpay ships as CommonJS; require gives the correct constructor.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private razorpay: any = null;

  constructor(private readonly prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret && !keyId.includes('your')) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
  }

  private ensureRazorpay() {
    if (!this.razorpay) {
      throw new BadRequestException('Payments are not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.');
    }
    return this.razorpay;
  }

  /**
   * Create a Razorpay order for either a plan purchase or a wallet top-up.
   * Returns the order + public key so the frontend can open Razorpay Checkout.
   */
  async createOrder(tenantId: string, input: { type: 'plan' | 'wallet'; planId?: string; amount?: number }) {
    const rzp = this.ensureRazorpay();

    let amountInr = 0;
    let notes: Record<string, string> = { tenantId, type: input.type };

    if (input.type === 'plan') {
      if (!input.planId) throw new BadRequestException('planId is required');
      const plan = await this.prisma.plan.findUnique({ where: { id: input.planId } });
      if (!plan) throw new NotFoundException('Plan not found');
      if (plan.priceMonthly <= 0) throw new BadRequestException('This plan is free — no payment needed.');
      amountInr = plan.priceMonthly;
      notes.planId = plan.id;
      notes.planName = plan.name;
    } else {
      if (!input.amount || input.amount <= 0) throw new BadRequestException('A valid amount is required');
      amountInr = input.amount;
    }

    const order = await rzp.orders.create({
      amount: Math.round(amountInr * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${input.type}_${Date.now()}`,
      notes,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify the Razorpay payment signature, then fulfil the order
   * (activate the plan or credit the wallet). Never trust the client — only
   * a valid signature computed with our secret unlocks fulfilment.
   */
  async verifyPayment(tenantId: string, input: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    type: 'plan' | 'wallet';
    planId?: string;
    amount?: number;
  }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new BadRequestException('Payments are not configured.');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest('hex');

    // Constant-time comparison to avoid signature timing side-channels.
    const expectedBuf = Buffer.from(expected, 'utf8');
    const providedBuf = Buffer.from(input.razorpay_signature || '', 'utf8');
    const signatureValid =
      expectedBuf.length === providedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!signatureValid) {
      this.logger.warn(`Invalid payment signature for tenant ${tenantId}`);
      throw new BadRequestException('Payment verification failed');
    }

    if (input.type === 'plan') {
      if (!input.planId) throw new BadRequestException('planId is required');
      const sub = await this.subscribe(tenantId, input.planId);
      return { status: 'success', type: 'plan', subscription: sub };
    } else {
      if (!input.amount || input.amount <= 0) throw new BadRequestException('Invalid amount');
      const wallet = await this.addCredits(tenantId, input.amount, `Razorpay top-up (${input.razorpay_payment_id})`);
      return { status: 'success', type: 'wallet', ...wallet };
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true, isPublic: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getSubscription(tenantId: string) {
    return this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
  }

  async getWallet(tenantId: string) {
    return this.prisma.creditWallet.findUnique({
      where: { tenantId },
    });
  }

  async getWalletTransactions(tenantId: string, page = 1, pageSize = 20) {
    const wallet = await this.prisma.creditWallet.findUnique({ where: { tenantId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return { transactions, total, page, pageSize };
  }

  async getInvoices(tenantId: string, page = 1, pageSize = 20) {
    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.invoice.count({ where: { tenantId } }),
    ]);
    return { invoices, total, page, pageSize };
  }

  /**
   * Activate (or switch) a plan for the tenant. Creates/updates the Subscription
   * record and marks the tenant ACTIVE. No payment gateway is wired yet, so this
   * activates the plan directly (as an admin/manual activation).
   */
  async subscribe(tenantId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription = await this.prisma.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
      include: { plan: true },
    });

    // Make sure the tenant is active on a paid plan.
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ACTIVE' } });

    return subscription;
  }

  async addCredits(tenantId: string, amount: number, description: string) {
    const wallet = await this.prisma.creditWallet.findUniqueOrThrow({ where: { tenantId } });
    const newBalance = wallet.balance + amount;

    await this.prisma.$transaction([
      this.prisma.creditWallet.update({ where: { tenantId }, data: { balance: newBalance, lastRechargeAt: new Date() } }),
      this.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: 'CREDIT', amount, balance: newBalance, description },
      }),
    ]);

    return { balance: newBalance };
  }

  async deductCredits(tenantId: string, amount: number, description: string) {
    const wallet = await this.prisma.creditWallet.findUniqueOrThrow({ where: { tenantId } });
    const newBalance = Math.max(0, wallet.balance - amount);

    await this.prisma.$transaction([
      this.prisma.creditWallet.update({ where: { tenantId }, data: { balance: newBalance } }),
      this.prisma.walletTransaction.create({
        data: { walletId: wallet.id, type: 'DEBIT', amount, balance: newBalance, description },
      }),
    ]);

    return { balance: newBalance };
  }
}
