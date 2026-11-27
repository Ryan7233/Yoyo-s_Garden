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
    // 周一有《雨点儿》录像课，要穿整套秋季校服；周日晚上整理书包时提醒
    date: '2026-11-29',
    taskId: 'pack-bag',
    title: '明天穿整套秋季校服',
    teacher: '下周有一节录像课讲授《雨点儿》，需要周一穿整套秋季校服。',
    steps: [
      { icon: '👕', text: '把整套秋季校服找出来，放在床头', tip: '上衣、裤子都要' },
      { icon: '🎒', text: '书包按明天的课整理好' },
      { icon: '📖', text: '睡前再读一遍《雨点儿》', tip: '录像课要用' },
    ],
  },
  {
    date: '2026-11-24',
    taskId: 'writing',
    title: '《江南》听写',
    teacher: '背诵江南，练习江南听写。',
    steps: [
      { icon: '👀', text: '翻到《江南》，把课后要写的字读两遍', tip: '不会读的看拼音' },
      { icon: '✏️', text: '每个字写两遍', tip: '照着课本，一笔一画' },
      { icon: '👂', text: '请爸爸妈妈报，盖住课本写一遍', tip: '错的再写三遍' },
    ],
  },
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

/** 只看老师当天单独留的（不算每天都有的阅读卡） */
export function datedTaskNoteFor(taskId: string, today: string): TaskNote | undefined {
  return TASK_NOTES.find((n) => n.taskId === taskId && n.date === today)
}

/** 老师当天留的优先，没有就用每天都有的卡 */
export function taskNoteFor(taskId: string, today: string): TaskNote | undefined {
  const daily = DAILY_NOTES.find((n) => n.taskId === taskId)
  return TASK_NOTES.find((n) => n.taskId === taskId && n.date === today) ?? (daily && { ...daily, date: today })
}
