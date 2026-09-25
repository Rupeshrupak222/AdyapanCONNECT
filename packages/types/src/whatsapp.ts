export enum WhatsAppNumberStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  PENDING = 'PENDING',
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
  BANNED = 'BANNED',
}

export enum QualityRating {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
  UNKNOWN = 'UNKNOWN',
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  STICKER = 'STICKER',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  TEMPLATE = 'TEMPLATE',
  INTERACTIVE = 'INTERACTIVE',
  REACTION = 'REACTION',
  SYSTEM = 'SYSTEM',
}

export interface WhatsAppPhoneNumber {
  id: string;
  tenantId: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  businessName: string;
  status: WhatsAppNumberStatus;
  qualityRating: QualityRating;
  messagingLimit: string;
  webhookStatus: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  type: MessageType;
  text?: { body: string };
  image?: { link: string; caption?: string };
  video?: { link: string; caption?: string };
  audio?: { link: string };
  document?: { link: string; caption?: string; filename?: string };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  interactive?: any;
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: WebhookContact[];
    messages?: WebhookMessage[];
    statuses?: WebhookStatus[];
  };
  field: string;
}

export interface WebhookContact {
  profile: { name: string };
  wa_id: string;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string };
  audio?: { id: string; mime_type: string };
  video?: { id: string; mime_type: string };
  document?: { id: string; filename: string; mime_type: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  interactive?: { type: string; [key: string]: any };
}

export interface WebhookStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  conversation?: { id: string; origin?: { type: string } };
  pricing?: { pricing_model: string; billable: boolean; category: string };
  errors?: Array<{ code: number; title: string; message: string; error_data?: any }>;
}
