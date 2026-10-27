import Dexie, { type EntityTable, type Transaction } from 'dexie'
import type {
  Child, DayPlan, ExerciseDef, ExerciseRecord, InventoryItem, LedgerEntry, PlacedItem,
  PlantInstance, Plot, Settings, SpellInk, SpellSession, SpellWord, TaskDef, TaskRecord, Unlock, Wish,
} from '../data/types'
import { SPELLING_HINT, SPELLING_HINT_V3, SPELLING_TASK_ID, spellingTasks } from '../data/tasks'
import { daysToFreeze, freezePlan } from '../engine/plans'
import { toTaskDay } from '../engine/taskDay'

export const SCHEMA_VERSION = 5

export interface VideoBlob { id: string; blob: Blob; createdAt: string }
export interface Snapshot { id: string; schemaVersion: number; at: string; data: string }
export type ExerciseConfig = ExerciseDef & { childId: string }

export class GardenDB extends Dexie {
  children!: EntityTable<Child, 'id'>
  tasks!: EntityTable<TaskDef, 'id'>
  exercises!: EntityTable<ExerciseConfig, 'id'>
  taskRecords!: EntityTable<TaskRecord, 'id'>
  exerciseRecords!: EntityTable<ExerciseRecord, 'id'>
  ledger!: EntityTable<LedgerEntry, 'id'>
  inventory!: EntityTable<InventoryItem, 'id'>
  placed!: EntityTable<PlacedItem, 'id'>
  plants!: EntityTable<PlantInstance, 'id'>
  plots!: Dexie.Table<Plot, [string, number, number]>
  unlocks!: EntityTable<Unlock, 'id'>
  wishes!: Dexie.Table<Wish, string>
  settings!: EntityTable<Settings, 'id'>
  videos!: EntityTable<VideoBlob, 'id'>
  snapshots!: EntityTable<Snapshot, 'id'>
  dayPlans!: Dexie.Table<DayPlan, [string, string]>
  spellWords!: EntityTable<SpellWord, 'id'>
  spellSessions!: EntityTable<SpellSession, 'id'>
  spellInks!: EntityTable<SpellInk, 'id'>

  constructor(name = 'little-garden') {
    super(name)
    this.version(1).stores({
      children: 'id',
      tasks: 'id, childId, order',
      exercises: 'id, childId',
      taskRecords: 'id, childId, taskId, date, status, [childId+date]',
      exerciseRecords: 'id, childId, exerciseId, date, status',
      ledger: 'id, childId, at, date, refId, reason',
      inventory: 'id, childId, catalogId, [childId+catalogId]',
      placed: 'id, childId, scene',
      plants: 'id, childId, scene',
      plots: '[childId+x+y], childId',
      unlocks: 'id, childId, kind, refId, [childId+kind+refId]',
      wishes: 'childId',
      settings: 'id',
      videos: 'id',
      snapshots: 'id, at',
    })
    // 2：按日期保存任务配置，过去的全勤和统计按当天的配置计算
    this.version(2).stores({ dayPlans: '[childId+date], childId' }).upgrade(async (tx) => {
      await snapshotBeforeMigration(tx, 1, V1_TABLES)
      const today = toTaskDay(new Date())
      for (const child of await tx.table<Child>('children').toArray()) {
        const tasks = await tx.table<TaskDef>('tasks').where('childId').equals(child.id).toArray()
        const days = daysToFreeze(toTaskDay(new Date(child.createdAt)), today, new Set())
        await tx.table<DayPlan>('dayPlans').bulkPut(days.map((d) => freezePlan(tasks, child.id, d)))
      }
    })
    // 3：拼写本。老档案补上“拼 3 个词”和“周末小听写”，先把过去的日子按旧配置冻结，过去的全勤不受影响
    this.version(3).stores({
      spellWords: 'id, childId, [childId+word]',
      spellSessions: 'id, childId, date',
    }).upgrade(async (tx) => {
      await snapshotBeforeMigration(tx, 2, [...V1_TABLES, 'dayPlans'])
      const today = toTaskDay(new Date())
      for (const child of await tx.table<Child>('children').toArray()) {
        const tasks = await tx.table<TaskDef>('tasks').where('childId').equals(child.id).toArray()
        const frozen = await tx.table<DayPlan>('dayPlans').where('childId').equals(child.id).toArray()
        const days = daysToFreeze(toTaskDay(new Date(child.createdAt)), today, new Set(frozen.map((p) => p.date)))
        await tx.table<DayPlan>('dayPlans').bulkPut(days.map((d) => freezePlan(tasks, child.id, d)))
        const missing = spellingTasks(child.id, tasks.length).filter((t) => !tasks.some((x) => x.id === t.id))
        await tx.table<TaskDef>('tasks').bulkAdd(missing)
      }
    })
    // 4：默写笔迹（和纪录视频一样单独存，不进备份）。只加新表，原数据不变
    this.version(4).stores({ spellInks: 'id, childId, sessionId, at' })
    // 5：拼写词改成自动给，换掉“拼 3 个词”的旧说明（家长自己改过的不动）。只改这一条文字
    this.version(5).stores({}).upgrade(async (tx) => {
      await tx.table<TaskDef>('tasks').where('id').equals(SPELLING_TASK_ID).modify((t) => {
        if (t.hint === SPELLING_HINT_V3) t.hint = SPELLING_HINT
      })
    })
  }
}

/** 升级结构前，把当前全部数据存一份快照，出问题时可以找回 */
async function snapshotBeforeMigration(tx: Transaction, fromVersion: number, tables: readonly string[]) {
  const data: Record<string, unknown[]> = {}
  for (const t of tables) data[t] = await tx.table(t).toArray()
  const at = new Date().toISOString()
  await tx.table<Snapshot>('snapshots').add({ id: `before-v${fromVersion + 1}-${at}`, schemaVersion: fromVersion, at, data: JSON.stringify(data) })
}

const V1_TABLES = [
  'children', 'tasks', 'exercises', 'taskRecords', 'exerciseRecords', 'ledger',
  'inventory', 'placed', 'plants', 'plots', 'unlocks', 'wishes', 'settings',
] as const

/** 进入备份的数据表（视频、默写笔迹和迁移快照不进备份） */
export const BACKUP_TABLES = [...V1_TABLES, 'dayPlans', 'spellWords', 'spellSessions'] as const
export type BackupTable = (typeof BACKUP_TABLES)[number]

export let db = new GardenDB()

/** 测试用：换一个独立的库 */
export function useDatabase(next: GardenDB) {
  db = next
}

export function uid(): string {
  return crypto.randomUUID()
}

/** 申请持久化存储，降低被系统清理的概率 */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}
