export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum LeadScore {
  COLD = 'COLD',
  WARM = 'WARM',
  HOT = 'HOT',
  VERY_HOT = 'VERY_HOT',
}

export enum DealStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export interface Lead {
  id: string;
  tenantId: string;
  contactId: string;
  title: string;
  status: LeadStatus;
  score: number;
  scoreLabel: LeadScore;
  source?: string;
  ownerId?: string;
  value?: number;
  notes?: string;
  tags: string[];
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  tenantId: string;
  title: string;
  contactId?: string;
  leadId?: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate?: Date;
  ownerId?: string;
  source?: string;
  notes?: string;
  closedAt?: Date;
  wonAt?: Date;
  lostAt?: Date;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  color?: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
