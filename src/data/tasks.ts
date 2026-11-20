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
/** 美森英语外教课：原来叫“英语口语课”（周一到周五），版本 7 起改名、改成每天 */
export const ENGLISH_CLASS_TASK_ID = 'english-speaking'
export const ENGLISH_CLASS_NAME = '美森英语外教课'
export const ENGLISH_CLASS_HINT = '每天 25 分钟，按时上线、完整上完'
export const ENGLISH_CLASS_V6 = { name: '英语口语课', hint: '按时上线、完整上完' }

/** 版本 7 加的：周末棒球、周一伊顿英语课、伊顿课后作业（这周哪天做都行） */
export const WEEK7_TASK_IDS = ['baseball', 'eton-class', 'eton-homework']
/** 伊顿英语作业：任务牌上可以打开当天的课（见 data/etonLessons.ts） */
export const ETON_HOMEWORK_TASK_ID = 'eton-homework'

/** 每日拼读：老师发的拼读小卡片，读几遍、计时（版本 8 加的，见 data/pinyinCards.ts） */
export const PINYIN_TASK_ID = 'pinyin-reading'
/** 数学：老师留了当天作业的日子，点“我完成了”先弹出作业卡 */
export const MATH_TASK_ID = 'math'
/** 课文朗读和背诵：老师要读熟或背的课文，弹出朗读/背诵卡（见 data/reciteTexts.ts） */
export const RECITE_TASK_ID = 'recite'

/** 每日中文阅读：老师要求每天读书 15 分钟并记在阅读银行（版本 10 起必做，替换“学校作业”） */
export const CHINESE_READING_TASK_ID = 'chinese-reading'
export const HOMEWORK_TASK_ID = 'homework'
/** 版本 10：学校作业太宽泛，关掉；语文阅读改成每日中文阅读（必做）；课文背诵改名，读熟课文也放这里 */
export const V9_NAMES = {
  reading: { name: '语文阅读', hint: '分级读物 15 分钟，能讲一句读了什么' },
  recite: { name: '课文背诵', hint: '背给家长听' },
}
export const V10_NAMES = {
  reading: { name: '每日中文阅读', hint: '读书 15 分钟，记在阅读银行里' },
  recite: { name: '课文朗读和背诵', hint: '老师要读熟、要背的课文，读给 / 背给家长听' },
}

/** 向日葵举手：上课举手就记一次，结果不影响奖励（见 engine/courage.ts） */
export const RAISE_HAND_TASK_ID = 'raise-hand'

/** 版本 3 时“拼 3 个词”的说明（那时要家长加词），版本 5 升级时换成新说明 */
export const SPELLING_HINT_V3 = '牛津树里挑的词：看、读、盖住、写、对照，再听写复习词'
export const SPELLING_HINT_V9 = '每天 3 个新词，自动从易到难，也可以在拼写本里加书里的词：看、读、盖住、写、对照，再听写复习词'
export const SPELLING_HINT = '每天 1 个新词（先用伊顿要默写的词），再复习 2–3 个：看、读、盖住、写、对照'
export const SPELLING_NAME_V9 = '拼 3 个词'
export const SPELLING_NAME = '每日拼词'

type Seed = Omit<TaskDef, 'childId' | 'order' | 'enabled'>

const SEEDS: Seed[] = [
  { id: 'start-on-time', name: '说开始就开始', icon: '⏰', category: 'habit', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: true, hint: '到学习时间不讨价还价，几分钟内坐下开始' },
  { id: 'chinese-reading', name: V10_NAMES.reading.name, icon: '📚', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: true, hint: V10_NAMES.reading.hint },
  { id: ENGLISH_CLASS_TASK_ID, name: ENGLISH_CLASS_NAME, icon: '🗣️', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: true, hint: ENGLISH_CLASS_HINT },
  { id: 'english-reading', name: '英语阅读', icon: '📖', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: true, hint: '牛津树读 1 本，新书或复习都算' },
  { id: 'drink-water', name: '喝完一瓶水', icon: '💧', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 3, required: true, hint: '放学看水杯，一瓶喝完' },
  { id: EXERCISE_TASK_ID, name: '运动打卡', icon: '🏃', category: 'sport', confirmMode: 'value', schedule: DAILY, coins: 0, drops: 0, required: false, hint: '做了几项记几项' },
  { id: 'math', name: '数学', icon: '🔢', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 5, drops: 1, required: false, hint: '口算一组加思维题 1–2 道' },
  { id: 'writing', name: '写字', icon: '✏️', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '字帖一页' },
  { id: 'recite', name: V10_NAMES.recite.name, icon: '🎙️', category: 'study', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: V10_NAMES.recite.hint },
  // 版本 10 起默认关掉（太宽泛），留着是为了老档案的记录还能对上
  { id: HOMEWORK_TASK_ID, name: '学校作业', icon: '📝', category: 'study', confirmMode: 'parent', schedule: SCHOOL_DAYS, coins: 5, drops: 1, required: false, hint: '放学后独立完成，不用催' },
  { id: 'toilet-break', name: '课间主动上厕所', icon: '🚻', category: 'health', confirmMode: 'self', schedule: SCHOOL_DAYS, coins: 2, drops: 1, required: false, hint: '不憋到上课、不在课上举手' },
  { id: 'bedtime', name: '按时睡觉', icon: '🌙', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '到点上床' },
  { id: 'wake-up', name: '按时起床', icon: '🌞', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 3, drops: 1, required: false, hint: '闹钟响后几分钟内起来' },
  { id: 'eat-well', name: '好好吃饭', icon: '🍚', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '正餐吃完，不边吃边玩' },
  { id: 'screen-off', name: '到点自己关屏幕', icon: '📺', category: 'health', confirmMode: 'parent', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '动画片到时间自己关' },
  { id: 'pack-bag', name: '整理书包', icon: '🎒', category: 'habit', confirmMode: 'self', schedule: BEFORE_SCHOOL, coins: 2, drops: 1, required: false, hint: '准备好第二天的东西' },
  { id: 'tidy-up', name: '收拾书桌和玩具', icon: '🧹', category: 'habit', confirmMode: 'parent', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '睡前收好' },
  { id: 'wash-up', name: '自己洗澡刷牙', icon: '🪥', category: 'habit', confirmMode: 'self', schedule: DAILY, coins: 2, drops: 1, required: false, hint: '不用大人催' },
  { id: SPELLING_TASK_ID, name: SPELLING_NAME, icon: '✍️', category: 'study', confirmMode: 'parent', schedule: SCHOOL_DAYS, coins: 3, drops: 1, required: false, hint: SPELLING_HINT },
  { id: SPELLING_QUIZ_TASK_ID, name: '周末小听写', icon: '📝', category: 'study', confirmMode: 'parent', schedule: { kind: 'weekdays', days: [6] }, coins: 5, drops: 1, required: false, hint: '本周学过的词听写一遍，错的放进下周' },
  { id: 'baseball', name: '飞雪棒球训练', icon: '⚾', category: 'sport', confirmMode: 'parent', schedule: { kind: 'weekdays', days: [6, 0] }, coins: 5, drops: 2, required: false, hint: '飞雪棒球俱乐部，周六周日各一次，认真练完' },
  { id: 'eton-class', name: '伊顿英语课', icon: '🏫', category: 'study', confirmMode: 'parent', schedule: { kind: 'weekdays', days: [1] }, coins: 5, drops: 1, required: false, hint: '每周一，按时上课、完整上完' },
  { id: 'eton-homework', name: '伊顿英语作业', icon: '📒', category: 'study', confirmMode: 'parent', schedule: { kind: 'weekly' }, coins: 5, drops: 1, required: false, hint: '伊顿课的课后作业，这周哪天做完都行' },
  { id: RAISE_HAND_TASK_ID, name: '我今天举手了', icon: '🙋', category: 'habit', confirmMode: 'self', schedule: SCHOOL_DAYS, coins: 0, drops: 0, required: false, hint: '上课举手就记一次，答对、答错、没叫到都一样棒' },
  { id: PINYIN_TASK_ID, name: '每日拼读', icon: '🔤', category: 'study', confirmMode: 'parent', schedule: SCHOOL_DAYS, coins: 3, drops: 1, required: false, hint: '老师的拼读小卡片，读熟，记下读了几遍、最快用时' },
]

/** 新版本加的任务：老档案升级时补上（不影响过去的日子） */
export function spellingTasks(childId: string, fromOrder: number): TaskDef[] {
  return SEEDS.filter((t) => SPELLING_TASK_IDS.includes(t.id)).map((t, i) => ({ ...t, childId, order: fromOrder + i, enabled: true }))
}

export function week7Tasks(childId: string, fromOrder: number): TaskDef[] {
  return SEEDS.filter((t) => WEEK7_TASK_IDS.includes(t.id)).map((t, i) => ({ ...t, childId, order: fromOrder + i, enabled: true }))
}

export function raiseHandTask(childId: string, order: number): TaskDef {
  const t = SEEDS.find((s) => s.id === RAISE_HAND_TASK_ID)!
  return { ...t, childId, order, enabled: true }
}

export function pinyinTask(childId: string, order: number): TaskDef {
  const t = SEEDS.find((s) => s.id === PINYIN_TASK_ID)!
  return { ...t, childId, order, enabled: true }
}

export function defaultTasks(childId: string): TaskDef[] {
  return SEEDS.map((t, i) => ({ ...t, childId, order: i, enabled: t.id !== HOMEWORK_TASK_ID }))
}

/**
 * 版本 10 的任务调整（数据库升级和导入旧备份都用它）：
 * 学校作业关掉；语文阅读改成每日中文阅读，必做、每天，顶替学校作业的位置；课文背诵改名；
 * “拼 3 个词”减量成“每日拼词”（每天 1 个新词）。家长自己改过的名字和说明不动。
 */
export function applyV10Tasks(tasks: TaskDef[]): TaskDef[] {
  const homework = tasks.find((t) => t.id === HOMEWORK_TASK_ID)
  return tasks.map((t) => {
    if (t.id === HOMEWORK_TASK_ID) return { ...t, enabled: false, required: false }
    if (t.id === CHINESE_READING_TASK_ID)
      return {
        ...t,
        name: t.name === V9_NAMES.reading.name ? V10_NAMES.reading.name : t.name,
        hint: t.hint === V9_NAMES.reading.hint ? V10_NAMES.reading.hint : t.hint,
        schedule: DAILY,
        required: true,
        enabled: true,
        order: homework ? homework.order : t.order,
      }
    if (t.id === SPELLING_TASK_ID)
      return {
        ...t,
        name: t.name === SPELLING_NAME_V9 ? SPELLING_NAME : t.name,
        hint: t.hint === SPELLING_HINT_V9 ? SPELLING_HINT : t.hint,
      }
    if (t.id === RECITE_TASK_ID)
      return {
        ...t,
        name: t.name === V9_NAMES.recite.name ? V10_NAMES.recite.name : t.name,
        hint: t.hint === V9_NAMES.recite.hint ? V10_NAMES.recite.hint : t.hint,
      }
    return t
  })
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
