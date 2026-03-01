import type {
  Redeem,
  CreateRedeemPayload,
  TimedRedeem,
  BankedRedeem,
  CounterRedeem,
} from '~/types/redeems'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function createRedeem(redeems: Redeem[], payload: CreateRedeemPayload): void {
  const now = new Date().toISOString()
  const base = {
    id: generateId(),
    category: payload.category,
    redeemer: payload.redeemer,
    rewardName: payload.rewardName,
    note: payload.note || '',
    createdAt: now,
    updatedAt: now,
  }

  switch (payload.type) {
    case 'timed':
      redeems.push({
        ...base,
        type: 'timed',
        status: 'paused',
        requiredMs: payload.requiredMs,
        accumulatedMs: 0,
        timerStartedAt: null,
      })
      break

    case 'banked': {
      const existing = redeems.find(
        r =>
          r.type === 'banked'
          && r.redeemer === payload.redeemer
          && r.rewardName === payload.rewardName
          && r.status !== 'completed',
      ) as BankedRedeem | undefined

      if (existing) {
        existing.quantity += payload.quantity
        existing.totalRedeemed += payload.quantity
        existing.updatedAt = now
      }
      else {
        redeems.push({
          ...base,
          type: 'banked',
          status: 'active',
          quantity: payload.quantity,
          totalRedeemed: payload.quantity,
          totalConsumed: 0,
        })
      }
      break
    }

    case 'instant':
      redeems.push({
        ...base,
        type: 'instant',
        status: 'active',
        completedAt: null,
      })
      break

    case 'counter':
      redeems.push({
        ...base,
        type: 'counter',
        status: 'active',
        targetCount: payload.targetCount,
        currentCount: 0,
      })
      break

    case 'toggle':
      redeems.push({
        ...base,
        type: 'toggle',
        status: 'active',
        activatedAt: null,
        deactivatedAt: null,
      })
      break
  }
}

export function startTimer(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id) as TimedRedeem | undefined
  if (!r || r.type !== 'timed') return
  r.timerStartedAt = new Date().toISOString()
  r.status = 'active'
  r.updatedAt = new Date().toISOString()
}

export function pauseTimer(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id) as TimedRedeem | undefined
  if (!r || r.type !== 'timed' || !r.timerStartedAt) return
  r.accumulatedMs += Date.now() - new Date(r.timerStartedAt).getTime()
  r.timerStartedAt = null
  r.status = 'paused'
  r.updatedAt = new Date().toISOString()
}

export function completeTimer(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id) as TimedRedeem | undefined
  if (!r || r.type !== 'timed') return
  if (r.timerStartedAt) {
    r.accumulatedMs += Date.now() - new Date(r.timerStartedAt).getTime()
    r.timerStartedAt = null
  }
  r.status = 'completed'
  r.updatedAt = new Date().toISOString()
}

export function consumeBanked(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id) as BankedRedeem | undefined
  if (!r || r.type !== 'banked' || r.quantity <= 0) return
  r.quantity--
  r.totalConsumed++
  if (r.quantity === 0) r.status = 'completed'
  r.updatedAt = new Date().toISOString()
}

export function addToBanked(redeems: Redeem[], id: string, amount: number = 1): void {
  const r = redeems.find(r => r.id === id) as BankedRedeem | undefined
  if (!r || r.type !== 'banked') return
  r.quantity += amount
  r.totalRedeemed += amount
  if (r.status === 'completed') r.status = 'active'
  r.updatedAt = new Date().toISOString()
}

export function completeInstant(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id)
  if (!r || r.type !== 'instant') return
  r.completedAt = new Date().toISOString()
  r.status = 'completed'
  r.updatedAt = new Date().toISOString()
}

export function incrementCounter(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id) as CounterRedeem | undefined
  if (!r || r.type !== 'counter' || r.status === 'completed') return
  r.currentCount++
  if (r.currentCount >= r.targetCount) r.status = 'completed'
  r.updatedAt = new Date().toISOString()
}

export function decrementCounter(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id) as CounterRedeem | undefined
  if (!r || r.type !== 'counter' || r.currentCount <= 0) return
  r.currentCount--
  if (r.status === 'completed') r.status = 'active'
  r.updatedAt = new Date().toISOString()
}

export function activateToggle(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id)
  if (!r || r.type !== 'toggle') return
  r.activatedAt = new Date().toISOString()
  r.deactivatedAt = null
  r.status = 'active'
  r.updatedAt = new Date().toISOString()
}

export function deactivateToggle(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id)
  if (!r || r.type !== 'toggle') return
  r.deactivatedAt = new Date().toISOString()
  r.status = 'completed'
  r.updatedAt = new Date().toISOString()
}

export function deleteRedeem(redeems: Redeem[], id: string): void {
  const idx = redeems.findIndex(r => r.id === id)
  if (idx !== -1) redeems.splice(idx, 1)
}

export function resetRedeem(redeems: Redeem[], id: string): void {
  const r = redeems.find(r => r.id === id)
  if (!r) return
  const now = new Date().toISOString()
  switch (r.type) {
    case 'timed':
      r.status = 'paused'
      r.accumulatedMs = 0
      r.timerStartedAt = null
      break
    case 'banked':
      r.quantity = r.totalRedeemed
      r.totalConsumed = 0
      r.status = 'active'
      break
    case 'instant':
      r.status = 'active'
      r.completedAt = null
      break
    case 'counter':
      r.currentCount = 0
      r.status = 'active'
      break
    case 'toggle':
      r.activatedAt = null
      r.deactivatedAt = null
      r.status = 'active'
      break
  }
  r.updatedAt = now
}

export function updateNote(redeems: Redeem[], id: string, note: string): void {
  const r = redeems.find(r => r.id === id)
  if (!r) return
  r.note = note
  r.updatedAt = new Date().toISOString()
}
