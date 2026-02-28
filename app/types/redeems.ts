export type RedeemType = 'timed' | 'banked' | 'instant' | 'counter' | 'toggle'

export type RedeemStatus = 'active' | 'completed' | 'paused'

export interface BaseRedeem {
  id: string
  type: RedeemType
  redeemer: string
  rewardName: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface TimedRedeem extends BaseRedeem {
  type: 'timed'
  status: 'active' | 'paused' | 'completed'
  requiredMs: number
  accumulatedMs: number
  timerStartedAt: string | null
}

export interface BankedRedeem extends BaseRedeem {
  type: 'banked'
  status: 'active' | 'completed'
  quantity: number
  totalRedeemed: number
  totalConsumed: number
}

export interface InstantRedeem extends BaseRedeem {
  type: 'instant'
  status: 'active' | 'completed'
  completedAt: string | null
}

export interface CounterRedeem extends BaseRedeem {
  type: 'counter'
  status: 'active' | 'completed'
  targetCount: number
  currentCount: number
}

export interface ToggleRedeem extends BaseRedeem {
  type: 'toggle'
  status: 'active' | 'completed'
  activatedAt: string | null
  deactivatedAt: string | null
}

export type Redeem = TimedRedeem | BankedRedeem | InstantRedeem | CounterRedeem | ToggleRedeem

export interface CreateTimedPayload {
  type: 'timed'
  redeemer: string
  rewardName: string
  note?: string
  requiredMs: number
}

export interface CreateBankedPayload {
  type: 'banked'
  redeemer: string
  rewardName: string
  note?: string
  quantity: number
}

export interface CreateInstantPayload {
  type: 'instant'
  redeemer: string
  rewardName: string
  note?: string
}

export interface CreateCounterPayload {
  type: 'counter'
  redeemer: string
  rewardName: string
  note?: string
  targetCount: number
}

export interface CreateTogglePayload {
  type: 'toggle'
  redeemer: string
  rewardName: string
  note?: string
}

export type CreateRedeemPayload =
  | CreateTimedPayload
  | CreateBankedPayload
  | CreateInstantPayload
  | CreateCounterPayload
  | CreateTogglePayload
