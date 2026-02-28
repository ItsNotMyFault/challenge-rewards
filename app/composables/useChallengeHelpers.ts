export function useChallengeHelpers() {
  const categoryColors: Record<string, string> = {
    core: '#c8a82e',
    distance: '#d44040',
    speed: '#e8a020',
    steps: '#40b060',
    pace: '#5090d0',
    consistency: '#a855f7',
  }

  const categoryIcons: Record<string, string> = {
    core: '/icons/core.svg',
    distance: '/icons/distance.svg',
    speed: '/icons/speed.svg',
    steps: '/icons/steps.svg',
    pace: '/icons/pace.svg',
    consistency: '/icons/consistency.svg',
  }

  return { categoryColors, categoryIcons }
}
