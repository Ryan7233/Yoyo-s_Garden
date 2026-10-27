import { BACKUP_TABLES, SCHEMA_VERSION, db, type BackupTable } from './schema'
import { balanceOf } from '../engine/ledger'
import type { LedgerEntry, Settings } from '../data/types'

export interface BackupFile {
  app: 'little-garden'
  schemaVersion: number
  exportedAt: string
  tables: Record<BackupTable, unknown[]>
}

export interface BackupSummary {
  exportedAt: string
  childName: string
  coins: number
  drops: number
  itemCount: number
  recordDays: number
}

export async function exportBackup(now = new Date()): Promise<BackupFile> {
  const tables = {} as Record<BackupTable, unknown[]>
  await db.transaction('r', BACKUP_TABLES.map((t) => db.table(t)), async () => {
    for (const t of BACKUP_TABLES) tables[t] = await db.table(t).toArray()
  })
  return { app: 'little-garden', schemaVersion: SCHEMA_VERSION, exportedAt: now.toISOString(), tables }
}

export function backupFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `garden-backup-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}.json`
}

// ---- 逐表校验字段和类型 ----

type FieldType = 's' | 'n' | 'b' | 'o' | 'a' | 'n|null' | readonly string[]
type TableSpec = { key: readonly string[]; fields: Record<string, FieldType>; optional?: Record<string, FieldType> }

const STATUS = ['pending', 'done', 'rejected', 'revoked'] as const
const REASONS = [
  'task', 'exercise', 'bonus', 'allDone', 'streak', 'personalBest',
  'harvest', 'visitor', 'purchase', 'sell', 'water', 'expand', 'revoke', 'gift',
] as const

/** 每张表必须有的字段和类型（见 data/types.ts） */
const TABLE_SPECS: Record<BackupTable, TableSpec> = {
  children: {
    key: ['id'],
    fields: { id: 's', name: 's', gardenName: 's', houseColor: 's', theme: ['sakura', 'lavender', 'mint'], mascotName: 's', createdAt: 's' },
    optional: { wallStyle: 's', floorStyle: 's' },
  },
  tasks: {
    key: ['id'],
    fields: {
      id: 's', childId: 's', name: 's', icon: 's', category: ['study', 'health', 'sport', 'habit'], confirmMode: ['parent', 'self', 'value'],
      schedule: 'o', coins: 'n', drops: 'n', required: 'b', order: 'n', enabled: 'b',
    },
    optional: { hint: 's' },
  },
  exercises: {
    key: ['id'],
    fields: {
      id: 's', childId: 's', name: 's', icon: 's', unit: ['count', 'seconds', 'cm'], timer: ['countdown60', 'stopwatch', 'none'],
      target: 'n|null', days: 'a',
    },
    optional: { tip: 's' },
  },
  taskRecords: {
    key: ['id'],
    fields: { id: 's', childId: 's', taskId: 's', date: 's', status: STATUS, source: ['child', 'parent'], createdAt: 's' },
    optional: { note: 's', confirmedAt: 's' },
  },
  exerciseRecords: {
    key: ['id'],
    fields: {
      id: 's', childId: 's', exerciseId: 's', date: 's', value: 'n', isPersonalBest: 'b', status: STATUS, createdAt: 's', recordAttempt: 'b',
    },
    optional: { witness: ['parent', 'video'], videoBlobId: 's', note: 's' },
  },
  ledger: {
    key: ['id'],
    fields: { id: 's', childId: 's', at: 's', currency: ['coin', 'drop'], amount: 'n', reason: REASONS },
    optional: { date: 's', refId: 's', note: 's' },
  },
  inventory: { key: ['id'], fields: { id: 's', childId: 's', catalogId: 's', count: 'n' } },
  placed: {
    key: ['id'],
    fields: { id: 's', childId: 's', scene: ['outdoor', 'indoor'], layer: ['ground', 'wall'], catalogId: 's', x: 'n', y: 'n', flipped: 'b' },
    optional: { content: 's' },
  },
  plants: {
    key: ['id'],
    fields: {
      id: 's', childId: 's', scene: ['outdoor', 'indoor'], x: 'n', y: 'n', catalogId: 's', plantedAt: 's', waterCount: 'n', stage: 'n',
    },
    optional: { lastWateredDate: 's', lastHarvestWater: 'n', pondId: 's' },
  },
  plots: { key: ['childId', 'x', 'y'], fields: { childId: 's', x: 'n', y: 'n', kind: ['soil', 'pond'] } },
  unlocks: {
    key: ['id'],
    fields: { id: 's', childId: 's', kind: ['item', 'visitor', 'badge', 'codex'], refId: 's', at: 's' },
    optional: { seenAt: 's' },
  },
  wishes: { key: ['childId'], fields: { childId: 's', catalogId: 's', setAt: 's' } },
  settings: {
    key: ['id'],
    fields: { id: ['settings'], schemaVersion: 'n', sound: 'b', pinHash: 's', pinSalt: 's', requiredCap: 'n', backfillDays: 'n' },
    optional: { lastBackupAt: 's', lastSeenAt: 's', clockWentBack: 'b' },
  },
  dayPlans: { key: ['childId', 'date'], fields: { childId: 's', date: 's', required: 'a', more: 'a' } },
  spellWords: {
    key: ['id'],
    fields: {
      id: 's', childId: 's', word: 's', kind: ['phonics', 'sight', 'other'], startDay: 's', step: 'n', due: 's', misses: 'n', addedAt: 's',
    },
    optional: { zh: 's' },
  },
  spellSessions: {
    key: ['id'],
    fields: { id: 's', childId: 's', date: 's', mode: ['daily', 'quiz', 'baseline'], at: 's', results: 'a' },
    optional: { recordId: 's', graded: 'b' },
  },
}

function typeOk(v: unknown, t: FieldType): boolean {
  if (Array.isArray(t)) return typeof v === 'string' && t.includes(v)
  switch (t) {
    case 's': return typeof v === 'string'
    case 'n': return typeof v === 'number' && Number.isFinite(v)
    case 'b': return typeof v === 'boolean'
    case 'o': return typeof v === 'object' && v !== null && !Array.isArray(v)
    case 'a': return Array.isArray(v)
    case 'n|null': return v === null || (typeof v === 'number' && Number.isFinite(v))
  }
  return false
}

/** 逐表逐行校验，失败抛出“哪张表第几条哪个字段”的说明 */
export function validateTables(tables: Record<BackupTable, unknown[]>): void {
  for (const t of BACKUP_TABLES) {
    const spec = TABLE_SPECS[t]
    const list = tables[t]
    if (!Array.isArray(list)) throw new Error(`备份文件缺少数据：${t}`)
    const keys = new Set<string>()
    list.forEach((row, i) => {
      const where = `备份文件数据有误：${t} 第 ${i + 1} 条`
      if (typeof row !== 'object' || row === null || Array.isArray(row)) throw new Error(where)
      const r = row as Record<string, unknown>
      for (const [f, type] of Object.entries(spec.fields)) {
        if (!typeOk(r[f], type)) throw new Error(`${where}的 ${f}`)
      }
      for (const [f, type] of Object.entries(spec.optional ?? {})) {
        if (r[f] !== undefined && !typeOk(r[f], type)) throw new Error(`${where}的 ${f}`)
      }
      const key = JSON.stringify(spec.key.map((k) => r[k]))
      if (keys.has(key)) throw new Error(`${where}重复`)
      keys.add(key)
    })
  }
  if (!tables.children.length) throw new Error('备份文件数据有误：children 是空的')
  if (!tables.settings.length) throw new Error('备份文件数据有误：settings 是空的')
}

/** 校验格式和版本，失败抛出带中文说明的错误 */
export function parseBackup(text: string): BackupFile {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('这不是一个有效的备份文件')
  }
  const f = data as Partial<BackupFile>
  if (!f || f.app !== 'little-garden' || typeof f.schemaVersion !== 'number' || !f.tables) {
    throw new Error('这不是小花园的备份文件')
  }
  if (f.schemaVersion > SCHEMA_VERSION) {
    throw new Error('备份来自更新的版本，请先更新应用')
  }
  // 版本 1 的备份还没有按日期保存的任务配置：导入后按当前配置冻结过去的日子
  if (f.schemaVersion < 2 && f.tables.dayPlans === undefined) f.tables.dayPlans = []
  // 版本 3 之前没有拼写本
  if (f.schemaVersion < 3) {
    f.tables.spellWords ??= []
    f.tables.spellSessions ??= []
  }
  validateTables(f.tables as Record<BackupTable, unknown[]>)
  return f as BackupFile
}

export function summarize(f: BackupFile): BackupSummary {
  const children = f.tables.children as { name: string }[]
  const ledger = f.tables.ledger as LedgerEntry[]
  const bal = balanceOf(ledger)
  const inv = f.tables.inventory as { count: number }[]
  const days = new Set((f.tables.taskRecords as { date: string }[]).map((r) => r.date))
  return {
    exportedAt: f.exportedAt,
    childName: children[0]?.name ?? '',
    coins: bal.coin,
    drops: bal.drop,
    itemCount: inv.reduce((s, i) => s + i.count, 0) + f.tables.placed.length,
    recordDays: days.size,
  }
}

/** 覆盖当前数据：先校验，再在一个事务里清空并写入，任何一步失败整体回滚 */
export async function importBackup(f: BackupFile): Promise<void> {
  validateTables(f.tables)
  await db.transaction('rw', BACKUP_TABLES.map((t) => db.table(t)), async () => {
    for (const t of BACKUP_TABLES) {
      await db.table(t).clear()
      await db.table(t).bulkAdd(f.tables[t])
    }
  })
}

export async function markBackedUp(at = new Date()): Promise<void> {
  await db.settings.update('settings', { lastBackupAt: at.toISOString() } satisfies Partial<Settings>)
}

/** 优先用系统分享面板，不支持时退回下载 */
export async function shareOrDownload(f: BackupFile): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const name = backupFileName(new Date(f.exportedAt))
  const blob = new Blob([JSON.stringify(f)], { type: 'application/json' })
  const file = new File([blob], name, { type: 'application/json' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: name })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
