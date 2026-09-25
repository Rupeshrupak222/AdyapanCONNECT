export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export interface Message {
  id: string;
  conversationId: string;
  tenantId: string;
  externalId?: string;
  direction: MessageDirection;
  type: string;
  status: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  templateName?: string;
  templateData?: Record<string, any>;
  interactiveData?: Record<string, any>;
  replyToMessageId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  sentBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
