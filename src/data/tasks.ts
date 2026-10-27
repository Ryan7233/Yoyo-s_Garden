import type { TaskDef, TaskSchedule } from './types'

const DAILY: TaskSchedule = { kind: 'daily' }
/** 上学日：周一至周五 */
const SCHOOL_DAYS: TaskSchedule = { kind: 'weekdays', days: [1, 2, 3, 4, 5] }
/** 上学日前一天：周日至周四 */
const BEFORE_SCHOOL: TaskSchedule = { kind: 'weekdays', days: [0, 1, 2, 3, 4] }

/** 运动打卡任务 id，奖励由运动子项单独计算（见 4.3） */
export const EXERCISE_TASK_ID = 'sport'

/** 每日拼写和周末小听写：点开后在 YoYo Words 里手写默写 */
export const SPELLING_TASK_ID = 'spelling'
export const SPELLING_QUIZ_TASK_ID = 'spelling-quiz'
export const SPELLING_TASK_IDS = [SPELLING_TASK_ID, SPELLING_QUIZ_TASK_ID]
/** 版本 3 时“拼 3 个词”的说明（那时要家长加词），版本 5 升级时换成新说明 */
export const SPELLING_HINT_V3 = '牛津树里挑的词：看、读、盖住、写、对照，再听写复习词'
export const SPELLING_HINT = '每天 3 个新词，自动从易到难，也可以在拼写本里加书里的词：看、读、盖住、写、对照，再听写复习词'

type Seed = Omit<TaskDef, 'childId' | 'order' | 'enabled'>

const SEEDS: Seed[] = [
  { id: 'start-on-time', name: '说开始就开始', icon: '⏰', category: 'habit', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: true, hint: '到学习时间不讨价还价，几分钟内坐下开始' },
  { id: 'homework', name: '学校作业', icon: '📝', category: 'study', confirmMode: 'parent', schedule: SCHOOL_DAYS, coins: 5, drops: 1, required: true, hint: '放学后独立完成，不用催' },
  { id: 'english-speaking', name: '英语口语课', icon: '🗣️', category: 'study', confirmMode: 'parent', schedule: SCHOOL_DAYS, coins: 5, drops: 1, required: true, hint: '按时上线、完整上完' },
  { id: 'english-reading', name: '英语阅读', icon: '📖', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: true, hint: '牛津树读 1 本，新书或复习都算' },
  { id: 'drink-water', name: '喝完一瓶水', icon: '💧', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 3, required: true, hint: '放学看水杯，一瓶喝完' },
  { id: EXERCISE_TASK_ID, name: '运动打卡', icon: '🏃', category: 'sport', confirmMode: 'value', schedule: DAILY, coins: 0, drops: 0, required: false, hint: '做了几项记几项' },
  { id: 'chinese-reading', name: '语文阅读', icon: '📚', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: false, hint: '分级读物 15 分钟，能讲一句读了什么' },
  { id: 'math', name: '数学', icon: '🔢', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: false, hint: '口算一组加思维题 1–2 道' },
  { id: 'writing', name: '写字', icon: '✏️', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '字帖一页' },
  { id: 'recite', name: '课文背诵', icon: '🎙️', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '背给家长听' },
  { id: 'toilet-break', name: '课间主动上厕所', icon: '🚻', category: 'health', confirmMode: 'self', schedule: SCHOOL_DAYS, coins: 2, drops: 1, required: false, hint: '不憋到上课、不在课上举手' },
  { id: 'bedtime', name: '按时睡觉', icon: '🌙', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '到点上床' },
  { id: 'wake-up', name: '按时起床', icon: '🌞', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '闹钟响后几分钟内起来' },
  { id: 'eat-well', name: '好好吃饭', icon: '🍚', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '正餐吃完，不边吃边玩' },
  { id: 'screen-off', name: '到点自己关屏幕', icon: '📺', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '动画片到时间自己关' },
  { id: 'pack-bag', name: '整理书包', icon: '🎒', category: 'habit', confirmMode: 'self', schedule: BEFORE_SCHOOL, coins: 2, drops: 1, required: false, hint: '准备好第二天的东西' },
  { id: 'tidy-up', name: '收拾书桌和玩具', icon: '🧹', category: 'habit', confirmMode: 'parent', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '睡前收好' },
  { id: 'wash-up', name: '自己洗澡刷牙', icon: '🪥', category: 'habit', confirmMode: 'self', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '不用大人催' },
  { id: SPELLING_TASK_ID, name: '拼 3 个词', icon: '✍️', category: 'study', confirmMode: 'parent', schedule: SCHOOL_DAYS, coins: 3, drops: 1, required: false, hint: SPELLING_HINT },
  { id: SPELLING_QUIZ_TASK_ID, name: '周末小听写', icon: '📝', category: 'study', confirmMode: 'parent', schedule: { kind: 'weekdays', days: [6] }, coins: 5, drops: 1, required: false, hint: '本周学过的词听写一遍，错的放进下周' },
]

/** 新版本加的任务：老档案升级时补上（不影响过去的日子） */
export function spellingTasks(childId: string, fromOrder: number): TaskDef[] {
  return SEEDS.filter((t) => SPELLING_TASK_IDS.includes(t.id)).map((t, i) => ({ ...t, childId, order: fromOrder + i, enabled: true }))
}

export function defaultTasks(childId: string): TaskDef[] {
  return SEEDS.map((t, i) => ({ ...t, childId, order: i, enabled: true }))
}

export const CATEGORY_LABEL: Record<TaskDef['category'], string> = {
  study: '学习',
  health: '健康',
  sport: '运动',
  habit: '习惯',
}

export const CONFIRM_LABEL: Record<TaskDef['confirmMode'], string> = {
  parent: '家长确认',
  self: '孩子自报',
  value: '数值录入',
}

/** 阅读类任务（解锁书页花） */
export const READING_TASK_IDS = ['english-reading', 'chinese-reading']
