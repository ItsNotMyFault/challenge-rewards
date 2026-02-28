import type { RewardCategory } from '~/types/rewards'

export interface CategoryColorClasses {
  border: string
  bg: string
  text: string
  ring: string
}

const categoryColorMap: Record<RewardCategory, CategoryColorClasses> = {
  challenge: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-500', ring: 'ring-red-500/30' },
  fitness: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', ring: 'ring-orange-500/30' },
  cosmetic: { border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-500', ring: 'ring-pink-500/30' },
  entertainment: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', ring: 'ring-purple-500/30' },
  performance: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', ring: 'ring-blue-500/30' },
  social: { border: 'border-teal-500', bg: 'bg-teal-500/10', text: 'text-teal-500', ring: 'ring-teal-500/30' },
  wellness: { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-500', ring: 'ring-green-500/30' },
}

const categoryIconMap: Record<RewardCategory, string> = {
  challenge: 'i-lucide-swords',
  fitness: 'i-lucide-dumbbell',
  cosmetic: 'i-lucide-palette',
  entertainment: 'i-lucide-party-popper',
  performance: 'i-lucide-mic',
  social: 'i-lucide-users',
  wellness: 'i-lucide-heart-pulse',
}

export function useRewardHelpers() {
  function categoryIcon(category: RewardCategory): string {
    return categoryIconMap[category]
  }

  function categoryLabel(category: RewardCategory): string {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  function categoryColors(category: RewardCategory): CategoryColorClasses {
    return categoryColorMap[category]
  }

  const allCategories: { value: RewardCategory, label: string, icon: string }[] = [
    { value: 'challenge', label: 'Challenge', icon: 'i-lucide-swords' },
    { value: 'fitness', label: 'Fitness', icon: 'i-lucide-dumbbell' },
    { value: 'cosmetic', label: 'Cosmetic', icon: 'i-lucide-palette' },
    { value: 'entertainment', label: 'Entertainment', icon: 'i-lucide-party-popper' },
    { value: 'performance', label: 'Performance', icon: 'i-lucide-mic' },
    { value: 'social', label: 'Social', icon: 'i-lucide-users' },
    { value: 'wellness', label: 'Wellness', icon: 'i-lucide-heart-pulse' },
  ]

  return { categoryIcon, categoryLabel, categoryColors, allCategories }
}
