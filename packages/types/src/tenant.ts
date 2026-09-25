export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  CANCELLED = 'CANCELLED',
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  logoUrl?: string;
  websiteUrl?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  subscriptionId?: string;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  invitedAt?: Date;
  joinedAt?: Date;
  isActive: boolean;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  industry?: string;
  country?: string;
  timezone?: string;
  currency?: string;
}
