import type { Redeem, CreateRedeemPayload } from '~/types/redeems'

export type EventStatus = 'draft' | 'active' | 'completed'

export interface Fundraiser {
  id: string
  eventId: string
  userId: number | null
  name: string
  avatarColor: string
  goal: number
  raised: number
  twitchUrl: string
  donationUrl: string
  rewardCatalogIds: string[]
  redeems: Redeem[]
  createdAt: string
  updatedAt: string
}

export interface GameEvent {
  id: string
  name: string
  description: string
  goal: number
  donationUrl: string
  status: EventStatus
  fundraisers: Fundraiser[]
  fundraiserCount?: number
  raised?: number
  myFundraiserId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventPayload {
  name: string
  description: string
  goal: number
  donationUrl?: string
}

export interface UpdateEventPayload {
  name?: string
  description?: string
  goal?: number
  donationUrl?: string
  status?: EventStatus
}

export interface CreateFundraiserPayload {
  name: string
  goal: number
  twitchUrl?: string
  donationUrl?: string
  rewardCatalogIds: string[]
}

export interface UpdateFundraiserPayload {
  name?: string
  goal?: number
  raised?: number
  twitchUrl?: string
  donationUrl?: string
}
