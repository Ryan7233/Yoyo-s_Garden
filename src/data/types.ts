// 数据模型（见 docs/SPEC.md 第 9.4 节）

export interface Child {
  id: string
  name: string
  gardenName: string
  houseColor: string
  theme: ThemeName
  mascotName: string
  createdAt: string
  /** 当前墙纸和地板（墙纸地板物品 id） */
  wallStyle?: string
  floorStyle?: string
}
export type ThemeName = 'sakura' | 'lavender' | 'mint'

export type TaskCategory = 'study' | 'health' | 'sport' | 'habit'
export type ConfirmMode = 'parent' | 'self' | 'value'
/** 0 = 周日 */
export type TaskSchedule = { kind: 'daily' } | { kind: 'weekdays'; days: number[] }

export interface TaskDef {
  id: string
  childId: string
  name: string
  icon: string
  category: TaskCategory
  confirmMode: ConfirmMode
  schedule: TaskSchedule
  coins: number
  drops: number
  required: boolean
  hint?: string
  order: number
  enabled: boolean
}

export interface ExerciseDef {
  id: string
  name: string
  icon: string
  unit: 'count' | 'seconds' | 'cm'
  timer: 'countdown60' | 'stopwatch' | 'none'
  target: number | null
  days: number[]
  tip?: string
}

/** 某一天的任务配置快照：那天安排了哪些任务（按顺序），过了那天就不再变 */
export interface DayPlan {
  childId: string
  date: string
  required: string[]
  more: string[]
}

export type RecordStatus = 'pending' | 'done' | 'rejected' | 'revoked'
export interface TaskRecord {
  id: string
  childId: string
  taskId: string
  /** 'YYYY-MM-DD'，按日界线计算的任务日 */
  date: string
  status: RecordStatus
  source: 'child' | 'parent'
  note?: string
  createdAt: string
  confirmedAt?: string
}
export interface ExerciseRecord {
  id: string
  childId: string
  exerciseId: string
  date: string
  value: number
  isPersonalBest: boolean
  status: RecordStatus
  createdAt: string
  recordAttempt: boolean
  witness?: 'parent' | 'video'
  /** 视频存 IndexedDB，家长确认或驳回后删除 */
  videoBlobId?: string
  /** 家长驳回时附的一句话 */
  note?: string
}

export type Currency = 'coin' | 'drop'
export type LedgerReason =
  | 'task' | 'exercise' | 'bonus' | 'allDone' | 'streak' | 'personalBest'
  | 'harvest' | 'visitor' | 'purchase' | 'sell' | 'water' | 'expand' | 'revoke' | 'gift'
export interface LedgerEntry {
  id: string
  childId: string
  at: string
  /** 归属的任务日（便于统计今日所得） */
  date?: string
  currency: Currency
  /** 收入为正，支出为负 */
  amount: number
  reason: LedgerReason
  refId?: string
  note?: string
}

export type UnlockRule = {
  kind: 'allDoneDays' | 'taskCount' | 'personalBests' | 'harvests' | 'placedCount'
  taskIds?: string[]
  count: number
}
export interface PlantSpec {
  waterToMature: number
  perennial: boolean
  regrowWater?: number
  harvestCoins: number
  harvestItem?: string
  needs: 'soil' | 'pond' | 'indoor'
}
export type CatalogKind = 'seed' | 'outdoor' | 'indoor' | 'wall' | 'wallStyle' | 'floorStyle' | 'special'
export interface CatalogItem {
  id: string
  kind: CatalogKind
  name: string
  /** emoji，或以 'svg:' 开头的自绘图标 id */
  icon: string
  price: number
  size: [number, number]
  unlock?: UnlockRule
  plant?: PlantSpec
  note?: string
  /** 初始拥有，不在商店出售 */
  starter?: boolean
}

export interface InventoryItem { id: string; childId: string; catalogId: string; count: number }
export interface PlacedItem {
  id: string
  childId: string
  scene: 'outdoor' | 'indoor'
  layer: 'ground' | 'wall'
  catalogId: string
  x: number
  y: number
  flipped: boolean
  /** 花瓶里插的鲜花（收获物 id） */
  content?: string
}
export interface PlantInstance {
  id: string
  childId: string
  scene: 'outdoor' | 'indoor'
  x: number
  y: number
  catalogId: string
  plantedAt: string
  waterCount: number
  lastWateredDate?: string
  stage: 0 | 1 | 2 | 3
  /** 多年生植物上次收获时的浇水次数，避免同一轮重复收获 */
  lastHarvestWater?: number
  /** 种在池塘里时，所在池塘（已摆放物品 id）；位置跟着池塘走 */
  pondId?: string
}
export interface Plot { childId: string; x: number; y: number; kind: 'soil' | 'pond' }
export interface Unlock {
  id: string
  childId: string
  kind: 'item' | 'visitor' | 'badge' | 'codex'
  refId: string
  at: string
  /** 孩子看过这条解锁提示的时间 */
  seenAt?: string
}
export interface Wish { childId: string; catalogId: string; setAt: string }
export interface Settings {
  id: 'settings'
  schemaVersion: number
  sound: boolean
  pinHash: string
  pinSalt: string
  requiredCap: number
  backfillDays: number
  lastBackupAt?: string
  /** 最近一次看到的系统时间，用于检测时间倒退 */
  lastSeenAt?: string
  clockWentBack?: boolean
}

/** 拼写本里的一个词。phonics：符合拼读规律；sight：高频词；other：认识会说就够了，家长坚持要拼 */
export type SpellKind = 'phonics' | 'sight' | 'other'
export interface SpellWord {
  id: string
  childId: string
  /** 小写 */
  word: string
  kind: SpellKind
  zh?: string
  /** 第 1 天：学这个新词的那天（上学日） */
  startDay: string
  /** 0 = 还没学；1~3 = 已完成第几次复习前的练习；4 = 第 7 天也复习过了 */
  step: number
  /** 下一次该练的日子 */
  due: string
  /** 周末听写里写错、放回下周的次数 */
  misses: number
  addedAt: string
  /** auto：按 Words 词库自动给的；parent：家长加的（老数据没有这个字段，当作家长加的） */
  source?: 'auto' | 'parent'
  /** 家长点了“会写，跳过” */
  known?: boolean
}
export interface SpellResult {
  word: string
  kind: 'new' | 'review'
  firstTry: boolean
  done: boolean
  attempts: number
  /** 谁判的对错：self 孩子自查；parent 家长判过或改过；none 还没判（周末小听写交卷后） */
  checkedBy?: 'self' | 'parent' | 'none'
  /** 这次默写之前这个词在第几步，家长改判时用它重新排期 */
  stepBefore?: number
}
/** 一次默写（每日拼写、周末小听写或摸底） */
export interface SpellSession {
  id: string
  childId: string
  date: string
  mode: 'daily' | 'quiz' | 'baseline'
  at: string
  results: SpellResult[]
  /** 对应的任务打卡记录（等家长确认的那条） */
  recordId?: string
  /** 周末小听写：家长批改完了 */
  graded?: boolean
}
/** 孩子默写时第一次写的笔迹（缩略图），给家长确认时看。不进备份，30 天后清理 */
export interface SpellInk {
  /** sessionId + ':' + word */
  id: string
  childId: string
  sessionId: string
  word: string
  dataUrl: string
  at: string
}
