import Dexie, { type EntityTable } from 'dexie'
import type {
  Child, ExerciseDef, ExerciseRecord, InventoryItem, LedgerEntry, PlacedItem,
  PlantInstance, Plot, Settings, TaskDef, TaskRecord, Unlock, Wish,
} from '../data/types'

export const SCHEMA_VERSION = 1

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

  constructor(name = 'little-garden') {
    super(name)
    this.version(SCHEMA_VERSION).stores({
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
    // 以后升级结构：
    // this.version(2).stores({...}).upgrade(async (tx) => { await snapshotBeforeMigration(tx, 1); ... })
  }
}

/** 进入备份的数据表（视频和迁移快照不进备份） */
export const BACKUP_TABLES = [
  'children', 'tasks', 'exercises', 'taskRecords', 'exerciseRecords', 'ledger',
  'inventory', 'placed', 'plants', 'plots', 'unlocks', 'wishes', 'settings',
] as const
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
