import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { childReportTask, confirmRecord, parentMarkDone, rejectRecord, revokeRecord, setupChild } from './actions'
import { exportBackup, importBackup, parseBackup, summarize } from './backup'
import { balanceOf } from '../engine/ledger'

const SAT = new Date(2026, 9, 17, 18, 0) // 周六：必做 3 项
const DAY = '2026-10-17'

async function balance(childId: string) {
  return balanceOf(await db.ledger.where('childId').equals(childId).toArray())
}

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, SAT)
  childId = child.id
})

describe('任务流程', () => {
  it('初始赠送 5 滴水和种子', async () => {
    expect(await balance(childId)).toEqual({ coin: 0, drop: 5 })
    expect(await db.inventory.count()).toBe(2)
    expect(await db.plots.count()).toBe(6)
  })

  it('自报任务立即到账', async () => {
    const r = await childReportTask(childId, 'wash-up', DAY, SAT)
    expect(r.status).toBe('done')
    expect(await balance(childId)).toEqual({ coin: 2, drop: 6 })
  })

  it('家长确认任务先进待确认，确认后到账；驳回不发放', async () => {
    const r = await childReportTask(childId, 'start-on-time', DAY, SAT)
    expect(r.status).toBe('pending')
    expect((await balance(childId)).coin).toBe(0)
    await confirmRecord(r.id, SAT)
    expect((await balance(childId)).coin).toBe(5)

    const r2 = await childReportTask(childId, 'english-reading', DAY, SAT)
    await rejectRecord(r2.id, '明天再试试', SAT)
    expect((await db.taskRecords.get(r2.id))?.note).toBe('明天再试试')
    expect((await balance(childId)).coin).toBe(5)
  })

  it('全勤奖励，撤销后扣回且余额不为负', async () => {
    for (const t of ['start-on-time', 'english-reading', 'drink-water']) await parentMarkDone(childId, t, DAY, SAT)
    // 5 + 5 + 3 + 全勤 5
    expect(await balance(childId)).toEqual({ coin: 18, drop: 10 })
    // 花掉一些
    await db.ledger.add({ id: 'spend', childId, at: SAT.toISOString(), currency: 'coin', amount: -16, reason: 'purchase' })
    const rec = (await db.taskRecords.toArray()).find((r) => r.taskId === 'drink-water')!
    await revokeRecord(rec.id, SAT)
    const b = await balance(childId)
    expect(b.coin).toBe(0)
    expect(b.drop).toBe(7)
  })

  it('连续 3 天全勤 +3', async () => {
    const days = [[2026, 9, 17], [2026, 9, 18], [2026, 9, 19]] as const
    let total = 0
    for (const [y, m, d] of days) {
      const now = new Date(y, m, d, 20)
      const day = `${y}-${m + 1}-${d}`
      const { tasksForDay } = await import('../engine/schedule')
      const req = tasksForDay(await db.tasks.toArray(), day).required
      for (const t of req) {
        await parentMarkDone(childId, t.id, day, now)
        total += t.coins
      }
      total += 5
    }
    expect((await balance(childId)).coin).toBe(total + 3)
  })
})

describe('备份', () => {
  it('导出再导入后数据一致', async () => {
    await childReportTask(childId, 'wash-up', DAY, SAT)
    const file = await exportBackup(SAT)
    const text = JSON.stringify(file)
    const parsed = parseBackup(text)
    const sum = summarize(parsed)
    expect(sum).toMatchObject({ childName: '小花', coins: 2, drops: 6, recordDays: 1 })

    useDatabase(new GardenDB(`restore-${Math.random()}`))
    await importBackup(parsed)
    const again = await exportBackup(SAT)
    expect(again.tables).toEqual(file.tables)
  })

  it('拒绝无效文件', () => {
    expect(() => parseBackup('not json')).toThrow()
    expect(() => parseBackup('{"app":"other"}')).toThrow()
    expect(() => parseBackup(JSON.stringify({ app: 'little-garden', schemaVersion: 99, tables: {} }))).toThrow('更新的版本')
  })
})
