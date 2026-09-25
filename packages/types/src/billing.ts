export enum PlanTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  PAID = 'PAID',
  VOID = 'VOID',
  UNCOLLECTIBLE = 'UNCOLLECTIBLE',
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  description?: string;
  priceMonthly: number;
  priceAnnual?: number;
  currency: string;
  limits: PlanLimits;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanLimits {
  contacts: number;
  agents: number;
  whatsappNumbers: number;
  campaigns: number;
  apiRequestsPerMonth: number;
  aiMessagesPerMonth: number;
  automations: number;
  storageGb: number;
  teamMembers: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  plan?: Plan;
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  description: string;
  lineItems: InvoiceLineItem[];
  paidAt?: Date;
  dueAt?: Date;
  createdAt: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface WalletBalance {
  tenantId: string;
  balance: number;
  currency: string;
  autoRechargeEnabled: boolean;
  autoRechargeThreshold?: number;
  autoRechargeAmount?: number;
  lastRechargeAt?: Date;
}
