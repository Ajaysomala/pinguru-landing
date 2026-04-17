// src/lib/types.ts
// All shared TypeScript interfaces for PinGuru

export interface User {
  id: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  business_category?: string;
  plan: 'free' | 'starter' | 'pro';
  instagram_connected: boolean;
  instagram_username?: string;
  instagram_user_id?: string;
  email_verified: boolean;
  onboarding_complete?: boolean;
  created_at?: string;
}

export interface DashboardStats {
  dms_sent_this_month: number;
  active_rules: number;
  dm_limit: number | null;
  dm_remaining?: number | null;
  plan: string;
  success_rate?: number;
  total_dms_sent?: number;
}

export interface Rule {
  id: string;
  name: string;
  trigger_type: 'keyword' | 'story_mention' | 'comment' | 'new_dm';
  keywords: string[];
  response_template: string;
  is_active: boolean;
  created_at: string;
  dm_count?: number;
}

export interface RuleCreatePayload {
  name: string;
  trigger_type: 'keyword' | 'story_mention' | 'comment' | 'new_dm';
  keywords: string[];
  response_template: string;
}

export interface Plan {
  id: string;
  name: 'free' | 'starter' | 'pro';
  display_name: string;
  price_inr: number;
  dm_limit: number;
  rule_limit: number;
  features: string[];
  stripe_price_id?: string;
}

export interface AnalyticsData {
  date: string;
  dms_sent: number;
  success_count: number;
}

export interface InstagramStatus {
  connected: boolean;
  username?: string;
  user_id?: string;
  token_expires_at?: string;
  profile_picture?: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}

export type TriggerType = 'keyword' | 'story_mention' | 'comment' | 'new_dm';

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  keyword:       'Keyword Match',
  story_mention: 'Story Mention',
  comment:       'Comment Reply',
  new_dm:        'New DM Received',
};

export const BUSINESS_CATEGORIES = [
  'E-commerce / Retail',
  'Food & Beverage',
  'Fashion & Beauty',
  'Fitness & Wellness',
  'Education & Coaching',
  'Real Estate',
  'Travel & Hospitality',
  'Technology / SaaS',
  'Creator / Influencer',
  'Agency / Marketing',
  'Other',
];
