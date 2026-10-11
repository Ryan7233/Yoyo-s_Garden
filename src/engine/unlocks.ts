import type { UnlockRule } from '../data/types'

export interface ProgressStats {
  allDoneDays: number
  /** taskId → 累计完成次数 */
  taskCounts: Record<string, number>
  personalBests: number
  harvests: number
  placedCount: number
}

export function ruleProgress(rule: UnlockRule, s: ProgressStats): number {
  switch (rule.kind) {
    case 'allDoneDays':
      return s.allDoneDays
    case 'personalBests':
      return s.personalBests
    case 'harvests':
      return s.harvests
    case 'placedCount':
      return s.placedCount
    case 'taskCount':
      return (rule.taskIds ?? []).reduce((sum, id) => sum + (s.taskCounts[id] ?? 0), 0)
  }
}

export function isUnlocked(rule: UnlockRule | undefined, s: ProgressStats): boolean {
  return !rule || ruleProgress(rule, s) >= rule.count
}
