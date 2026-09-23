// src/types/index.ts
// Re-export both UI suite types and library types
export * from './suite';
export type {
  User,
  DashboardStats,
  Rule,
  RuleCreatePayload,
  InstagramMediaItem,
  Plan,
  AnalyticsData,
  InstagramStatus,
  ApiError,
  PlanStatus,
} from '../lib/types';
