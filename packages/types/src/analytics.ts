export interface DashboardStats {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  replies: number;
  clicks: number;
  activeConversations: number;
  openLeads: number;
  campaignCost: number;
  revenue: number;
  roi: number;
}

export interface MessageAnalytics {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  replied: number;
}

export interface CampaignAnalytics {
  campaignId: string;
  name: string;
  sent: number;
  delivered: number;
  deliveryRate: number;
  read: number;
  readRate: number;
  replied: number;
  replyRate: number;
  clicked: number;
  clickRate: number;
  cost: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  conversationsHandled: number;
  averageResponseTime: number;
  resolutionRate: number;
  customerSatisfaction?: number;
}
