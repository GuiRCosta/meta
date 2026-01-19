// Campaign Types
export type CampaignObjective = 
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_APP_PROMOTION'
  | 'OUTCOME_SALES';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';

export interface Campaign {
  id: string;
  metaId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  createdAt: Date;
  updatedAt: Date;
  adSets?: AdSet[];
  metrics?: CampaignMetrics;
}

export interface AdSet {
  id: string;
  metaId: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  dailyBudget?: number;
  targeting?: Targeting;
  ads?: Ad[];
}

export interface Ad {
  id: string;
  metaId: string;
  adSetId: string;
  name: string;
  status: CampaignStatus;
  creative?: Creative;
}

export interface Targeting {
  ageMin?: number;
  ageMax?: number;
  genders?: number[];
  countries?: string[];
  interests?: string[];
}

export interface Creative {
  title?: string;
  body?: string;
  imageUrl?: string;
  linkUrl?: string;
}

// Metrics Types
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
  cpm: number;
  conversions?: number;
  roas?: number;
  reach?: number;
}

export interface DailyMetrics extends CampaignMetrics {
  date: string;
}

// Budget Types
export interface BudgetSettings {
  monthlyLimit: number;
  alertThresholds: number[]; // e.g., [50, 80, 100]
  conversionGoal?: number;
  roasGoal?: number;
  cpcLimit?: number;
  ctrMinimum?: number;
}

export interface BudgetStatus {
  currentSpend: number;
  monthlyLimit: number;
  percentage: number;
  projectedSpend: number;
  daysRemaining: number;
  isOverBudget: boolean;
  willExceedBudget: boolean;
}

// Notification Types
export interface NotificationSettings {
  enabled: boolean;
  dailyReportTime: string; // e.g., "18:00"
  whatsappNumber: string;
  types: {
    dailyReports: boolean;
    immediateAlerts: boolean;
    suggestions: boolean;
    statusChanges: boolean;
  };
}

// Alert Types
export type AlertType = 'error' | 'warning' | 'info' | 'success';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  campaignId?: string;
  campaignName?: string;
  createdAt: Date;
  read: boolean;
}

// Agent Types
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AgentAction[];
}

export interface AgentAction {
  type: 'confirm' | 'cancel' | 'edit' | 'view';
  label: string;
  payload?: Record<string, unknown>;
}

// Dashboard Types
export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pausedCampaigns: number;
  todaySpend: number;
  monthSpend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas?: number;
}

export interface TopCampaign {
  id: string;
  name: string;
  metric: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}
