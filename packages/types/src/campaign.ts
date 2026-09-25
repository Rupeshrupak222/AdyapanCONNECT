export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum CampaignType {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULED = 'SCHEDULED',
  RECURRING = 'RECURRING',
  CSV = 'CSV',
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  phoneNumberId: string;
  templateId: string;
  segmentIds: string[];
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  clickCount: number;
  replyCount: number;
  estimatedCost?: number;
  actualCost?: number;
  variables?: Record<string, string>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  type: CampaignType;
  phoneNumberId: string;
  templateId: string;
  segmentIds: string[];
  scheduledAt?: Date;
  variables?: Record<string, string>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
