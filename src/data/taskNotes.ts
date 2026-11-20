/**
 * 老师当天留在某个已有任务上的作业（写字、语文阅读……）：按日期放，只在那一天显示。
 * 在那个任务上点“我完成了”先弹出这张卡，几个步骤都打勾再交。
 * 拼读、数学、背课文、伊顿英语各有自己的卡，不放这里。
 */
export interface TaskNote {
  date: string
  /** 挂在哪个任务上（data/tasks.ts 里的 id） */
  taskId: string
  title: string
  /** 老师的原话 */
  teacher: string
  /** timer：这一步带一个几分钟的计时器，时间到自动打勾 */
  steps: { icon: string; text: string; tip?: string; timer?: number }[]
}

export const TASK_NOTES: TaskNote[] = [
  {
    date: '2026-11-17',
    taskId: 'writing',
    title: '课后字词，准备听写',
    teacher: '自主练习本课课后字词，准备听写。',
    steps: [
      { icon: '👀', text: '翻到这一课后面的生字词，一个一个读两遍', tip: '不会读的看拼音' },
      { icon: '✏️', text: '每个字词写两遍', tip: '照着课本，一笔一画' },
      { icon: '👂', text: '请爸爸妈妈报，盖住课本写一遍', tip: '错的再写三遍' },
    ],
  },
]

/** 每天都有的卡：每日中文阅读，读满 15 分钟（可以用计时器），再记到阅读银行 */
const DAILY_NOTES: Omit<TaskNote, 'date'>[] = [
  {
    taskId: 'chinese-reading',
    title: '读书 15 分钟',
    teacher: '每日读书 15 分钟并记录在阅读银行。',
    steps: [
      { icon: '📚', text: '读书 15 分钟', tip: '点「开始计时」，时间到会响；不用计时器读够了也可以直接打勾', timer: 15 },
      { icon: '🏦', text: '在阅读银行里记下今天读的书' },
    ],
  },
]

/** 老师当天留的优先，没有就用每天都有的卡 */
export function taskNoteFor(taskId: string, today: string): TaskNote | undefined {
  const daily = DAILY_NOTES.find((n) => n.taskId === taskId)
  return TASK_NOTES.find((n) => n.taskId === taskId && n.date === today) ?? (daily && { ...daily, date: today })
}
