import type { RedeemType } from '~/types/redeems'

export interface TypeColorClasses {
  border: string
  bg: string
  text: string
  ring: string
}

const typeColorMap: Record<RedeemType, TypeColorClasses> = {
  timed: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', ring: 'ring-blue-500/30' },
  banked: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', ring: 'ring-amber-500/30' },
  instant: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/30' },
  counter: { border: 'border-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-500', ring: 'ring-violet-500/30' },
  toggle: { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-500', ring: 'ring-cyan-500/30' },
}

export function useRedeemHelpers() {
  function statusColor(status: string): 'success' | 'warning' | 'neutral' {
    switch (status) {
      case 'active': return 'success'
      case 'paused': return 'warning'
      case 'completed': return 'neutral'
      default: return 'neutral'
    }
  }

  function typeIcon(type: RedeemType): string {
    switch (type) {
      case 'timed': return 'i-lucide-timer'
      case 'banked': return 'i-lucide-piggy-bank'
      case 'instant': return 'i-lucide-zap'
      case 'counter': return 'i-lucide-hash'
      case 'toggle': return 'i-lucide-toggle-left'
    }
  }

  function typeLabel(type: RedeemType): string {
    switch (type) {
      case 'timed': return 'Timed'
      case 'banked': return 'Banked'
      case 'instant': return 'Instant'
      case 'counter': return 'Counter'
      case 'toggle': return 'Toggle'
    }
  }

  function typeColors(type: RedeemType): TypeColorClasses {
    return typeColorMap[type]
  }

  function relativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  return { statusColor, typeIcon, typeLabel, typeColors, relativeTime, formatDuration }
}
