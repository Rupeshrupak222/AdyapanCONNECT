export enum TemplateCategory {
  MARKETING = 'MARKETING',
  UTILITY = 'UTILITY',
  AUTHENTICATION = 'AUTHENTICATION',
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED',
  PAUSED = 'PAUSED',
}

export enum TemplateHeaderType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
}

export enum TemplateButtonType {
  QUICK_REPLY = 'QUICK_REPLY',
  URL = 'URL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  COPY_CODE = 'COPY_CODE',
}

export interface TemplateHeader {
  type: TemplateHeaderType;
  text?: string;
  example?: string[];
}

export interface TemplateButton {
  type: TemplateButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  example?: string[];
}

export interface WhatsAppTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  header?: TemplateHeader;
  body: string;
  bodyVariables: string[];
  footer?: string;
  buttons: TemplateButton[];
  externalId?: string;
  rejectionReason?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
