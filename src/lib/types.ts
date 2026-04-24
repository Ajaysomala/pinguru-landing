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
  dm_failed_this_month?: number;
  active_rules: number;
  dm_limit: number | null;
  dm_remaining?: number | null;
  plan: string;
  success_rate?: number | null;
  total_dms_sent?: number;
  analytics_tier?: 'basic' | 'premium';
  premium_analytics_enabled?: boolean;
  avg_dms_per_day_30d?: number | null;
  best_day_30d?: { date: string; sent: number } | null;
  peak_hour_utc?: number | null;
  busiest_weekday?: string | null;
}

export interface Rule {
  id: string;
  name: string;
  trigger_type: 'keyword' | 'story_mention' | 'comment' | 'new_dm';
  keywords: string[];
  response_template: string;
  comment_target_type?: 'specific' | 'any';
  comment_media_filter?: 'post' | 'reel' | 'all';
  comment_media_id?: string;
  comment_media_permalink?: string;
  comment_media_caption?: string;
  comment_media_type?: string;
  dm_attachment_url?: string;
  dm_attachment_type?: string;
  any_comment_keyword?: boolean;
  public_comment_reply_enabled?: boolean;
  public_comment_reply_template?: string;
  ask_follow_before_dm?: boolean;
  is_active: boolean;
  created_at: string;
  dm_count?: number;
}

export interface RuleCreatePayload {
  name: string;
  trigger_type: 'keyword' | 'story_mention' | 'comment' | 'new_dm';
  keywords: string[];
  response_template: string;
  comment_target_type?: 'specific' | 'any';
  comment_media_filter?: 'post' | 'reel' | 'all';
  comment_media_id?: string;
  comment_media_permalink?: string;
  comment_media_caption?: string;
  comment_media_type?: string;
  dm_attachment_url?: string;
  dm_attachment_type?: string;
  any_comment_keyword?: boolean;
  public_comment_reply_enabled?: boolean;
  public_comment_reply_template?: string;
  ask_follow_before_dm?: boolean;
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'post' | 'reel' | 'all';
  media_product_type?: string | null;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
}

export interface Plan {
  id: string;
  name: 'free' | 'starter' | 'pro';
  display_name: string;
  price_inr: number;
  dm_limit: number | null;
  rule_limit: number | 'Unlimited';
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

export interface PlanStatus {
  current_plan: 'free' | 'starter' | 'pro';
  pending_plan: 'free' | 'starter' | 'pro' | null;
  current_billing_cycle: 'monthly' | 'quarterly' | 'yearly' | null;
  pending_billing_cycle: 'monthly' | 'quarterly' | 'yearly' | null;
  subscription_id: string | null;
  is_active_paid: boolean;
  is_checkout_pending: boolean;
  payment_provider: string | null;
}

export type TriggerType = 'keyword' | 'story_mention' | 'comment' | 'new_dm';

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  keyword:       'Keyword Match',
  story_mention: 'Story Reply',
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
