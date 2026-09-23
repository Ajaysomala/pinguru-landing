// src/types/suite.ts
// Clean TypeScript interfaces for PinGuru UI components

export type PageTab = 
  | 'dashboard' 
  | 'instagram' 
  | 'automations' 
  | 'analytics' 
  | 'settings';

export type TriggerType = 'keyword_dm' | 'story_mention' | 'post_comment' | 'welcome_dm';
export type MatchMode = 'exact' | 'contains' | 'starts_with';
export type ActionType = 'simple_text' | 'button_link' | 'card_carousel';

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: TriggerType;
  keywords: string[];
  matchMode: MatchMode;
  responseMessage: string;
  actionType: ActionType;
  buttonLabel?: string;
  buttonUrl?: string;
  postTarget?: 'all_posts' | 'latest_reel' | 'specific_post';
  delaySeconds: number;
  isActive: boolean;
  triggersCount: number;
  clicksCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
  cooldownHours?: number;
}
