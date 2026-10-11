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
  videoBlobId?: string
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
}
export interface Plot { childId: string; x: number; y: number; kind: 'soil' | 'pond' }
export interface Unlock {
  id: string
  childId: string
  kind: 'item' | 'visitor' | 'badge' | 'codex'
  refId: string
  at: string
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
