import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase, uid } from './schema'
import { setupChild } from './actions'
import { buyItem } from './garden'
import { clearWish, markUnlocksSeen, setWish, syncProgress } from './progress'
import { balanceOf } from '../engine/ledger'

const NOW = new Date(2026, 9, 17, 18, 0)

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, NOW)
  childId = child.id
})

async function coins() {
  return balanceOf(await db.ledger.where('childId').equals(childId).toArray()).coin
}

describe('进度同步', () => {
  it('访客第一次来访奖励 5 金币，只发一次', async () => {
    await db.plants.add({ id: uid(), childId, scene: 'outdoor', x: 4, y: 4, catalogId: 'seed-carrot', plantedAt: '', waterCount: 3, stage: 3 })
    const g = await syncProgress(childId, NOW)
    expect(g.visitors).toEqual(['rabbit'])
    expect(g.badges).toContain('first-visitor')
    expect(await coins()).toBe(5)
    await syncProgress(childId, NOW)
    expect(await coins()).toBe(5)
  })

  it('解锁特殊植物时送 1 颗种子，提示看过后标记', async () => {
    // 7 个全勤日：周六必做 3 项
    const required = ['start-on-time', 'english-reading', 'drink-water']
    for (let i = 0; i < 7; i++) {
      const date = `2026-10-${String(1 + i).padStart(2, '0')}`
      for (const taskId of required) {
        await db.taskRecords.add({ id: uid(), childId, taskId, date, status: 'done', source: 'parent', createdAt: `${date}T10:00:00Z` })
      }
    }
    const tasks = await db.tasks.where('childId').equals(childId).toArray()
    // 让这 7 天的必做都只有这 3 项
    for (const t of tasks) if (t.required && !required.includes(t.id)) await db.tasks.update(t.id, { required: false })
    const g = await syncProgress(childId, NOW)
    expect(g.items).toEqual(['seed-rainbow-flower'])
    expect((await db.inventory.where({ childId, catalogId: 'seed-rainbow-flower' }).first())?.count).toBe(1)
    const unseen = (await db.unlocks.toArray()).filter((u) => !u.seenAt)
    expect(unseen.map((u) => u.refId).sort()).toEqual(['first-all-done', 'seed-rainbow-flower'])
    await markUnlocksSeen(unseen.map((u) => u.id), NOW)
    expect((await db.unlocks.toArray()).every((u) => u.seenAt)).toBe(true)
  })
})

describe('心愿单', () => {
  it('设为心愿、买到后清空；免费特殊装饰不能许愿也不能买', async () => {
    expect(await setWish(childId, 'out-golden-swing', NOW)).toBe(false)
    expect(await buyItem(childId, 'out-golden-swing', NOW)).toEqual({ ok: false, reason: 'unknown' })
    expect(await setWish(childId, 'seed-daisy', NOW)).toBe(true)
    await db.ledger.add({ id: uid(), childId, at: NOW.toISOString(), currency: 'coin', amount: 10, reason: 'bonus' })
    expect(await buyItem(childId, 'seed-tulip', NOW)).toEqual({ ok: true, wishDone: false })
    expect(await db.wishes.get(childId)).toBeTruthy()
    await db.ledger.add({ id: uid(), childId, at: NOW.toISOString(), currency: 'coin', amount: 10, reason: 'bonus' })
    expect(await buyItem(childId, 'seed-daisy', NOW)).toEqual({ ok: true, wishDone: true })
    expect(await db.wishes.get(childId)).toBeUndefined()
    await setWish(childId, 'seed-daisy', NOW)
    await clearWish(childId)
    expect(await db.wishes.count()).toBe(0)
  })
})
