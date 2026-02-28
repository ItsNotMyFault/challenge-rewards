import type { RedeemType } from '~/types/redeems'

export type RewardCategory =
  | 'challenge'
  | 'fitness'
  | 'cosmetic'
  | 'entertainment'
  | 'performance'
  | 'social'
  | 'wellness'

interface BaseRewardTemplate {
  id: string
  rewardName: string
  type: RedeemType
  description: string
  icon: string
  category: RewardCategory
  createdAt: string
  updatedAt: string
}

export interface TimedRewardTemplate extends BaseRewardTemplate {
  type: 'timed'
  requiredMs: number
}

export interface BankedRewardTemplate extends BaseRewardTemplate {
  type: 'banked'
  quantity: number
}

export interface InstantRewardTemplate extends BaseRewardTemplate {
  type: 'instant'
}

export interface CounterRewardTemplate extends BaseRewardTemplate {
  type: 'counter'
  targetCount: number
}

export interface ToggleRewardTemplate extends BaseRewardTemplate {
  type: 'toggle'
}

export type RewardTemplate =
  | TimedRewardTemplate
  | BankedRewardTemplate
  | InstantRewardTemplate
  | CounterRewardTemplate
  | ToggleRewardTemplate

export type CreateRewardPayload = Omit<RewardTemplate, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateRewardPayload = Partial<CreateRewardPayload>
