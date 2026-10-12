import Dexie, { type EntityTable, type Transaction } from 'dexie'
import type {
  Child, DayPlan, ExerciseDef, ExerciseRecord, InventoryItem, LedgerEntry, PlacedItem,
  PlantInstance, Plot, Settings, TaskDef, TaskRecord, Unlock, Wish,
} from '../data/types'
import { daysToFreeze, freezePlan } from '../engine/plans'
import { toTaskDay } from '../engine/taskDay'

export const SCHEMA_VERSION = 2

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
      await snapshotBeforeMigration(tx, 1)
      const today = toTaskDay(new Date())
      for (const child of await tx.table<Child>('children').toArray()) {
        const tasks = await tx.table<TaskDef>('tasks').where('childId').equals(child.id).toArray()
        const days = daysToFreeze(toTaskDay(new Date(child.createdAt)), today, new Set())
        await tx.table<DayPlan>('dayPlans').bulkPut(days.map((d) => freezePlan(tasks, child.id, d)))
      }
    })
  }
}

/** 升级结构前，把当前全部数据存一份快照，出问题时可以找回 */
async function snapshotBeforeMigration(tx: Transaction, fromVersion: number) {
  const data: Record<string, unknown[]> = {}
  for (const t of V1_TABLES) data[t] = await tx.table(t).toArray()
  const at = new Date().toISOString()
  await tx.table<Snapshot>('snapshots').add({ id: `before-v${fromVersion + 1}-${at}`, schemaVersion: fromVersion, at, data: JSON.stringify(data) })
}

const V1_TABLES = [
  'children', 'tasks', 'exercises', 'taskRecords', 'exerciseRecords', 'ledger',
  'inventory', 'placed', 'plants', 'plots', 'unlocks', 'wishes', 'settings',
] as const

/** 进入备份的数据表（视频和迁移快照不进备份） */
export const BACKUP_TABLES = [...V1_TABLES, 'dayPlans'] as const
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
