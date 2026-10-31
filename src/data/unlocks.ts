import type { UnlockRule } from './types'
import { READING_TASK_IDS } from './tasks'

// 特殊物品解锁规则（5.7）：全部按累计数，不要求连续
export const UNLOCKS = {
  'rainbow-flower': { kind: 'allDoneDays', count: 7 },
  'book-flower': { kind: 'taskCount', taskIds: READING_TASK_IDS, count: 30 },
  'note-flower': { kind: 'taskCount', taskIds: ['english-speaking'], count: 20 },
  'star-tree': { kind: 'personalBests', count: 5 },
  'crystal-lotus': { kind: 'taskCount', taskIds: ['drink-water'], count: 20 },
  'golden-swing': { kind: 'allDoneDays', count: 30 },
  'star-lamp': { kind: 'allDoneDays', count: 100 },
} satisfies Record<string, UnlockRule>

export function describeUnlock(rule: UnlockRule): string {
  switch (rule.kind) {
    case 'allDoneDays':
      return `累计全勤 ${rule.count} 天`
    case 'personalBests':
      return `运动刷新纪录 ${rule.count} 次`
    case 'harvests':
      return `累计收获 ${rule.count} 次`
    case 'placedCount':
      return `摆放 ${rule.count} 件装饰`
    case 'taskCount':
      if (rule.taskIds?.includes('english-reading')) return `阅读累计 ${rule.count} 次`
      if (rule.taskIds?.includes('english-speaking')) return `外教课累计 ${rule.count} 节`
      if (rule.taskIds?.includes('drink-water')) return `喝水累计 ${rule.count} 天`
      return `完成任务 ${rule.count} 次`
  }
}
