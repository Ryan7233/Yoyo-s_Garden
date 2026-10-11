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
  for (const t of BACKUP_TABLES) {
    if (!Array.isArray(f.tables[t])) throw new Error(`备份文件缺少数据：${t}`)
  }
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

/** 覆盖当前数据 */
export async function importBackup(f: BackupFile): Promise<void> {
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
