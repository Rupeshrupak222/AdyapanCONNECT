export enum WorkflowTriggerType {
  CONTACT_CREATED = 'CONTACT_CREATED',
  CONTACT_UPDATED = 'CONTACT_UPDATED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_DELIVERED = 'MESSAGE_DELIVERED',
  MESSAGE_READ = 'MESSAGE_READ',
  TEMPLATE_APPROVED = 'TEMPLATE_APPROVED',
  CAMPAIGN_COMPLETED = 'CAMPAIGN_COMPLETED',
  LEAD_CREATED = 'LEAD_CREATED',
  DEAL_UPDATED = 'DEAL_UPDATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  SCHEDULE = 'SCHEDULE',
  API_REQUEST = 'API_REQUEST',
}

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config?: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: Record<string, any>;
}

export enum WorkflowNodeType {
  TRIGGER = 'TRIGGER',
  SEND_WHATSAPP = 'SEND_WHATSAPP',
  SEND_EMAIL = 'SEND_EMAIL',
  ADD_TAG = 'ADD_TAG',
  REMOVE_TAG = 'REMOVE_TAG',
  UPDATE_CONTACT = 'UPDATE_CONTACT',
  CREATE_LEAD = 'CREATE_LEAD',
  ASSIGN_AGENT = 'ASSIGN_AGENT',
  CREATE_TASK = 'CREATE_TASK',
  CALL_WEBHOOK = 'CALL_WEBHOOK',
  HTTP_REQUEST = 'HTTP_REQUEST',
  AI_ACTION = 'AI_ACTION',
  DELAY = 'DELAY',
  CONDITION = 'CONDITION',
  NOTIFY_TEAM = 'NOTIFY_TEAM',
  END = 'END',
}
