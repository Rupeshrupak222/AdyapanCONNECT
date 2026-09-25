export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  TENANT_OWNER = 'TENANT_OWNER',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  CAMPAIGN_MANAGER = 'CAMPAIGN_MANAGER',
  ANALYST = 'ANALYST',
  DEVELOPER = 'DEVELOPER',
  BILLING_MANAGER = 'BILLING_MANAGER',
  VIEWER = 'VIEWER',
}

export enum Permission {
  // Campaign permissions
  CAMPAIGN_CREATE = 'campaign.create',
  CAMPAIGN_EDIT = 'campaign.edit',
  CAMPAIGN_DELETE = 'campaign.delete',
  CAMPAIGN_LAUNCH = 'campaign.launch',
  CAMPAIGN_VIEW = 'campaign.view',

  // Conversation permissions
  CONVERSATION_VIEW = 'conversation.view',
  CONVERSATION_REPLY = 'conversation.reply',
  CONVERSATION_ASSIGN = 'conversation.assign',
  CONVERSATION_CLOSE = 'conversation.close',

  // Contact permissions
  CONTACT_CREATE = 'contact.create',
  CONTACT_EDIT = 'contact.edit',
  CONTACT_DELETE = 'contact.delete',
  CONTACT_EXPORT = 'contact.export',
  CONTACT_IMPORT = 'contact.import',
  CONTACT_VIEW = 'contact.view',

  // Template permissions
  TEMPLATE_CREATE = 'template.create',
  TEMPLATE_EDIT = 'template.edit',
  TEMPLATE_DELETE = 'template.delete',
  TEMPLATE_VIEW = 'template.view',

  // Analytics permissions
  ANALYTICS_VIEW = 'analytics.view',
  ANALYTICS_EXPORT = 'analytics.export',

  // Billing permissions
  BILLING_VIEW = 'billing.view',
  BILLING_MANAGE = 'billing.manage',

  // Developer permissions
  DEVELOPER_API_VIEW = 'developer.api.view',
  DEVELOPER_API_CREATE = 'developer.api.create',
  DEVELOPER_WEBHOOK_MANAGE = 'developer.webhook.manage',

  // Team permissions
  TEAM_INVITE = 'team.invite',
  TEAM_REMOVE = 'team.remove',
  TEAM_MANAGE = 'team.manage',

  // WhatsApp permissions
  WHATSAPP_CONNECT = 'whatsapp.connect',
  WHATSAPP_MANAGE = 'whatsapp.manage',
  WHATSAPP_VIEW = 'whatsapp.view',

  // Settings permissions
  SETTINGS_VIEW = 'settings.view',
  SETTINGS_MANAGE = 'settings.manage',

  // CRM permissions
  CRM_VIEW = 'crm.view',
  CRM_MANAGE = 'crm.manage',

  // Chatbot permissions
  CHATBOT_CREATE = 'chatbot.create',
  CHATBOT_EDIT = 'chatbot.edit',
  CHATBOT_DELETE = 'chatbot.delete',
  CHATBOT_VIEW = 'chatbot.view',

  // Workflow permissions
  WORKFLOW_CREATE = 'workflow.create',
  WORKFLOW_EDIT = 'workflow.edit',
  WORKFLOW_DELETE = 'workflow.delete',
  WORKFLOW_VIEW = 'workflow.view',

  // AI Agent permissions
  AI_AGENT_CREATE = 'ai_agent.create',
  AI_AGENT_EDIT = 'ai_agent.edit',
  AI_AGENT_VIEW = 'ai_agent.view',

  // Audit log permissions
  AUDIT_LOG_VIEW = 'audit_log.view',
}

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  role: UserRole;
  permissions: Permission[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginDto {
  email: string;
  password: string;
  tenantSlug?: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

export interface TwoFactorDto {
  code: string;
  tempToken: string;
}
