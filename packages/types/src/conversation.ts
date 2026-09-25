export enum ConversationStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  PENDING = 'PENDING',
  SNOOZED = 'SNOOZED',
  BOT = 'BOT',
}

export enum ConversationPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface Conversation {
  id: string;
  tenantId: string;
  phoneNumberId: string;
  contactId: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  assignedAgentId?: string;
  assignedTeamId?: string;
  subject?: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCount: number;
  isBot: boolean;
  snoozedUntil?: Date;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber: string;
    avatarUrl?: string;
  };
  assignedAgent?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}
