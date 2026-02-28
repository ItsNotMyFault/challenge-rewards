export type ChallengeCategory = 'core' | 'distance' | 'speed' | 'steps' | 'pace' | 'consistency'

export interface SkillTreeNode {
  id: string
  label: string
  description: string
  category: ChallengeCategory
  position: { x: number; y: number }
}

export interface SkillTreeEdge {
  source: string
  target: string
}

export interface SkillTreeData {
  nodes: SkillTreeNode[]
  edges: SkillTreeEdge[]
}

export interface WeeklySubChallenge {
  id: string
  week: number
  label: string
  description: string
  goal: string
}

export interface MonthlyChallenge {
  id: string
  month: string
  label: string
  description: string
  category: ChallengeCategory
  weeks: WeeklySubChallenge[]
}
