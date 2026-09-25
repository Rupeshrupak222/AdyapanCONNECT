export enum ContactOptStatus {
  OPTED_IN = 'OPTED_IN',
  OPTED_OUT = 'OPTED_OUT',
  PENDING = 'PENDING',
  UNKNOWN = 'UNKNOWN',
}

export interface Contact {
  id: string;
  tenantId: string;
  phoneNumber: string;
  countryCode: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
  optStatus: ContactOptStatus;
  leadScore: number;
  source?: string;
  notes?: string;
  lastInteractionAt?: Date;
  tags: string[];
  customAttributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateContactDto {
  phoneNumber: string;
  countryCode: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  tags?: string[];
  customAttributes?: Record<string, any>;
  source?: string;
}

export interface AudienceSegment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  conditionOperator: 'AND' | 'OR';
  contactCount: number;
  isDynamic: boolean;
  lastRefreshedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCondition {
  field: string;
  operator: SegmentOperator;
  value: any;
  type: 'attribute' | 'tag' | 'activity' | 'campaign';
}

export enum SegmentOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IS_SET = 'is_set',
  IS_NOT_SET = 'is_not_set',
  IN_LAST = 'in_last',
  NOT_IN_LAST = 'not_in_last',
}
