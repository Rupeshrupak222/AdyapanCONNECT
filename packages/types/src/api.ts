export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
  requestId?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface WebhookConfig {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  signingSecret: string;
  failureCount: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
