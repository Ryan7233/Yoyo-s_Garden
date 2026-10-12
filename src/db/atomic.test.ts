import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { childReportTask, confirmRecord, parentMarkDone, setupChild } from './actions'
import { logExercise } from './exercise'
import { balanceOf } from '../engine/ledger'

const SAT = new Date(2026, 9, 17, 18, 0) // 周六
const DAY = '2026-10-17'

async function balance() {
  return balanceOf(await db.ledger.where('childId').equals(childId).toArray())
}

/** 让流水写入失败，模拟发奖励时出错 */
function breakLedger() {
  db.ledger.hook('creating', () => {
    throw new Error('写入失败')
  })
}

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, SAT)
  childId = child.id
})

describe('重复点击只发一份奖励', () => {
  it('孩子连点两次“我完成了”', async () => {
    await Promise.all([childReportTask(childId, 'wash-up', DAY, SAT), childReportTask(childId, 'wash-up', DAY, SAT)])
    expect(await db.taskRecords.where('taskId').equals('wash-up').count()).toBe(1)
    expect(await balance()).toEqual({ coin: 2, drop: 6 })
  })

  it('家长连点两次“确认”', async () => {
    const r = await childReportTask(childId, 'start-on-time', DAY, SAT)
    await Promise.all([confirmRecord(r.id, SAT), confirmRecord(r.id, SAT)])
    expect((await balance()).coin).toBe(5)
  })

  it('家长连点两次“标记完成”', async () => {
    await Promise.all([parentMarkDone(childId, 'english-reading', DAY, SAT), parentMarkDone(childId, 'english-reading', DAY, SAT)])
    expect(await db.taskRecords.where('taskId').equals('english-reading').count()).toBe(1)
    expect((await balance()).coin).toBe(5)
  })

  it('运动连点两次“记录”', async () => {
    await Promise.all([
      logExercise(childId, 'jump-rope', DAY, 105, 'none', SAT),
      logExercise(childId, 'jump-rope', DAY, 105, 'none', SAT),
    ])
    // 第一次 2+1（达标），第二次同一项不再发
    expect((await balance()).coin).toBe(3)
  })
})

describe('写入失败整体回滚', () => {
  it('孩子自报：发奖励失败时不留下记录', async () => {
    breakLedger()
    await expect(childReportTask(childId, 'wash-up', DAY, SAT)).rejects.toThrow()
    expect(await db.taskRecords.count()).toBe(0)
  })

  it('家长确认：发奖励失败时记录仍是待确认', async () => {
    const r = await childReportTask(childId, 'start-on-time', DAY, SAT)
    breakLedger()
    await expect(confirmRecord(r.id, SAT)).rejects.toThrow()
    expect((await db.taskRecords.get(r.id))?.status).toBe('pending')
  })

  it('家长勾选：发奖励失败时不留下记录', async () => {
    breakLedger()
    await expect(parentMarkDone(childId, 'english-reading', DAY, SAT)).rejects.toThrow()
    expect(await db.taskRecords.count()).toBe(0)
  })

  it('运动记录：发奖励失败时不留下记录', async () => {
    breakLedger()
    await expect(logExercise(childId, 'jump-rope', DAY, 105, 'none', SAT)).rejects.toThrow()
    expect(await db.exerciseRecords.count()).toBe(0)
  })
})
