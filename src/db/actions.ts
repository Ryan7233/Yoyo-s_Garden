// 业务操作：组合 engine 纯函数和数据库写入。每次操作即时写入。
import { db, uid, SCHEMA_VERSION } from './schema'
import type { Child, LedgerEntry, PlacedItem, Settings, TaskDef, TaskRecord, ThemeName } from '../data/types'
import { defaultTasks } from '../data/tasks'
import { DEFAULT_EXERCISES } from '../data/exercises'
import { BALANCE } from '../data/balance'
import { balanceOf } from '../engine/ledger'
import { dayProgress, latestRecordByTask, reconcileDayAwards, revokeEntries, taskRewardEntries, type NewEntry } from '../engine/rewards'
import { addDays, diffDays, toTaskDay } from '../engine/taskDay'
import { hashPin, newSalt } from '../engine/pin'
import { starterPlots } from '../engine/plots'

export interface SetupInput {
  name: string
  gardenName: string
  theme: ThemeName
  houseColor: string
  mascotName: string
  pin: string
}

export async function setupChild(input: SetupInput, now = new Date()): Promise<Child> {
  const at = now.toISOString()
  const child: Child = {
    id: uid(),
    name: input.name.trim(),
    gardenName: input.gardenName.trim(),
    houseColor: input.houseColor,
    theme: input.theme,
    mascotName: input.mascotName.trim(),
    createdAt: at,
    wallStyle: 'wall-default',
    floorStyle: 'floor-wood',
  }
  const salt = newSalt()
  const settings: Settings = {
    id: 'settings',
    schemaVersion: SCHEMA_VERSION,
    sound: true,
    pinHash: await hashPin(input.pin, salt),
    pinSalt: salt,
    requiredCap: BALANCE.requiredCap,
    backfillDays: BALANCE.backfillDays,
    lastSeenAt: at,
  }
  const placed: PlacedItem[] = [
    { id: uid(), childId: child.id, scene: 'outdoor', layer: 'ground', catalogId: 'out-big-tree', x: 9, y: 5, flipped: false },
    { id: uid(), childId: child.id, scene: 'indoor', layer: 'ground', catalogId: 'in-bed', x: 0, y: 3, flipped: false },
    { id: uid(), childId: child.id, scene: 'indoor', layer: 'ground', catalogId: 'in-chair', x: 5, y: 2, flipped: false },
    { id: uid(), childId: child.id, scene: 'indoor', layer: 'ground', catalogId: 'in-vase', x: 6, y: 2, flipped: false },
  ]
  await db.transaction('rw', [db.children, db.settings, db.tasks, db.exercises, db.plots, db.placed, db.inventory, db.ledger], async () => {
    await db.children.add(child)
    await db.settings.put(settings)
    await db.tasks.bulkAdd(defaultTasks(child.id))
    await db.exercises.bulkAdd(DEFAULT_EXERCISES.map((e) => ({ ...e, childId: child.id })))
    await db.plots.bulkAdd(starterPlots(child.id))
    await db.placed.bulkAdd(placed)
    await db.inventory.bulkAdd(BALANCE.starter.seeds.map((s) => ({ id: uid(), childId: child.id, catalogId: s.catalogId, count: s.count })))
    await db.ledger.add({ id: uid(), childId: child.id, at, date: toTaskDay(now), currency: 'drop', amount: BALANCE.starter.drops, reason: 'gift', note: '欢迎礼物' })
  })
  return child
}

async function addEntries(childId: string, entries: NewEntry[], now: Date) {
  if (!entries.length) return
  const at = now.toISOString()
  await db.ledger.bulkAdd(entries.map((e) => ({ ...e, id: uid(), childId, at })))
}

async function ledgerOf(childId: string): Promise<LedgerEntry[]> {
  return db.ledger.where('childId').equals(childId).sortBy('at')
}

async function allDoneDaySet(childId: string): Promise<Set<string>> {
  const [tasks, records] = await Promise.all([
    db.tasks.where('childId').equals(childId).toArray(),
    db.taskRecords.where('childId').equals(childId).toArray(),
  ])
  const days = new Set(records.map((r) => r.date))
  const out = new Set<string>()
  for (const d of days) if (dayProgress(tasks, records, d).allDone) out.add(d)
  return out
}

/** 从 day 起到今天，重新对账全勤和连续奖励 */
export async function reconcileFrom(childId: string, day: string, now = new Date()) {
  const today = toTaskDay(now)
  const doneDays = await allDoneDaySet(childId)
  for (let d = day; diffDays(today, d) >= 0; d = addDays(d, 1)) {
    const ledger = await ledgerOf(childId)
    const entries = reconcileDayAwards(d, doneDays, ledger, balanceOf(ledger).coin)
    await addEntries(childId, entries, now)
  }
}

async function finishRecord(childId: string, record: TaskRecord, now: Date) {
  const task = await db.tasks.get(record.taskId)
  if (!task) return
  await addEntries(childId, taskRewardEntries(task, record), now)
  await reconcileFrom(childId, record.date, now)
}

/** 孩子点“我完成了” */
export async function childReportTask(childId: string, taskId: string, day: string, now = new Date()): Promise<TaskRecord> {
  const task = await db.tasks.get(taskId)
  if (!task) throw new Error('任务不存在')
  const records = await db.taskRecords.where('[childId+date]').equals([childId, day]).toArray()
  const existing = latestRecordByTask(records, day).get(taskId)
  if (existing && (existing.status === 'done' || existing.status === 'pending')) return existing
  const record: TaskRecord = {
    id: uid(),
    childId,
    taskId,
    date: day,
    status: task.confirmMode === 'parent' ? 'pending' : 'done',
    source: 'child',
    createdAt: now.toISOString(),
  }
  if (record.status === 'done') record.confirmedAt = record.createdAt
  await db.taskRecords.add(record)
  if (record.status === 'done') await finishRecord(childId, record, now)
  return record
}

/** 家长确认待确认记录 */
export async function confirmRecord(recordId: string, now = new Date()) {
  const r = await db.taskRecords.get(recordId)
  if (!r || r.status !== 'pending') return
  const next = { ...r, status: 'done' as const, confirmedAt: now.toISOString() }
  await db.taskRecords.put(next)
  await finishRecord(r.childId, next, now)
}

/** 家长驳回：不扣分，只是不发放，可附一句话 */
export async function rejectRecord(recordId: string, note: string | undefined, now = new Date()) {
  const r = await db.taskRecords.get(recordId)
  if (!r || r.status !== 'pending') return
  await db.taskRecords.put({ ...r, status: 'rejected', note: note?.trim() || undefined, confirmedAt: now.toISOString() })
}

/** 家长直接勾选孩子没点的任务 */
export async function parentMarkDone(childId: string, taskId: string, day: string, now = new Date()) {
  const records = await db.taskRecords.where('[childId+date]').equals([childId, day]).toArray()
  const existing = latestRecordByTask(records, day).get(taskId)
  if (existing?.status === 'done') return
  if (existing?.status === 'pending') return confirmRecord(existing.id, now)
  const record: TaskRecord = {
    id: uid(), childId, taskId, date: day, status: 'done', source: 'parent',
    createdAt: now.toISOString(), confirmedAt: now.toISOString(),
  }
  await db.taskRecords.add(record)
  await finishRecord(childId, record, now)
}

/** 撤销一条已完成的记录：扣回奖励，余额最低扣到 0 */
export async function revokeRecord(recordId: string, now = new Date()) {
  const r = await db.taskRecords.get(recordId)
  if (!r || r.status !== 'done') return
  await db.taskRecords.put({ ...r, status: 'revoked' })
  const ledger = await ledgerOf(r.childId)
  await addEntries(r.childId, revokeEntries(r.id, ledger, balanceOf(ledger), r.date), now)
  await reconcileFrom(r.childId, r.date, now)
}

/** 家长加分 */
export async function giveBonus(childId: string, reason: string, amount: number, now = new Date()) {
  await addEntries(childId, [{ date: toTaskDay(now), currency: 'coin', amount, reason: 'bonus', note: reason }], now)
}

/** 记录系统时间，发现时间倒退时标记（只提示，不拦截） */
export async function touchClock(now = new Date()) {
  const s = await db.settings.get('settings')
  if (!s) return
  const back = !!s.lastSeenAt && now.toISOString() < s.lastSeenAt
  await db.settings.update('settings', {
    lastSeenAt: back ? s.lastSeenAt : now.toISOString(),
    clockWentBack: s.clockWentBack || back,
  })
}

export async function updateSettings(patch: Partial<Settings>) {
  await db.settings.update('settings', patch)
}

export async function updateChild(id: string, patch: Partial<Child>) {
  await db.children.update(id, patch)
}

export async function changePin(pin: string) {
  const salt = newSalt()
  await db.settings.update('settings', { pinSalt: salt, pinHash: await hashPin(pin, salt) })
}

export async function resetAll() {
  await db.delete()
  await db.open()
}

// ---- 任务配置（家长） ----

export async function updateTask(id: string, patch: Partial<TaskDef>) {
  await db.tasks.update(id, patch)
}

export async function addTask(childId: string, input: Omit<TaskDef, 'id' | 'childId' | 'order' | 'enabled'>) {
  const count = await db.tasks.where('childId').equals(childId).count()
  await db.tasks.add({ ...input, id: uid(), childId, order: count, enabled: true })
}

/** 和相邻任务交换顺序 */
export async function moveTask(childId: string, id: string, dir: -1 | 1) {
  const list = await db.tasks.where('childId').equals(childId).sortBy('order')
  const i = list.findIndex((t) => t.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
  await db.transaction('rw', db.tasks, async () => {
    for (let k = 0; k < list.length; k++) await db.tasks.update(list[k].id, { order: k })
  })
}
