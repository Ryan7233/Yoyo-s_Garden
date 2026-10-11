import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { giveBonus, setupChild } from './actions'
import { buyItem, digUp, expandPlot, harvestPlant, plantSeed, progressStats, sellHarvest, waterPlant } from './garden'
import { balanceOf } from '../engine/ledger'

const day = (d: number) => new Date(2026, 9, d, 18)
let childId = ''

async function balance() {
  return balanceOf(await db.ledger.where('childId').equals(childId).toArray())
}
async function count(catalogId: string) {
  return (await db.inventory.where({ childId, catalogId }).first())?.count ?? 0
}

beforeEach(async () => {
  useDatabase(new GardenDB(`garden-${Math.random()}`))
  childId = (await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, day(1))).id
})

describe('商店', () => {
  it('钱不够不能买', async () => {
    expect(await buyItem(childId, 'seed-tulip', day(1))).toEqual({ ok: false, reason: 'coins' })
  })
  it('购买扣金币、进背包', async () => {
    await giveBonus(childId, '测试', 10, day(1))
    expect(await buyItem(childId, 'seed-tulip', day(1))).toEqual({ ok: true, wishDone: false })
    expect((await balance()).coin).toBe(2)
    expect(await count('seed-tulip')).toBe(1)
  })
  it('未解锁的特殊种子不能买', async () => {
    await giveBonus(childId, '测试', 50, day(1))
    expect(await buyItem(childId, 'seed-rainbow-flower', day(1))).toEqual({ ok: false, reason: 'locked' })
  })
})

describe('种植、浇水、收获', () => {
  it('向日葵：种下 → 三天浇三次 → 收获 → 地块变空', async () => {
    expect(await plantSeed(childId, 'seed-sunflower', 3, 4, day(1))).toBe(true)
    expect(await count('seed-sunflower')).toBe(2)
    expect(await plantSeed(childId, 'seed-sunflower', 3, 4, day(1))).toBe(false) // 已经有植物
    expect(await plantSeed(childId, 'seed-sunflower', 8, 1, day(1))).toBe(false) // 不是泥土地块
    const [p] = await db.plants.toArray()

    const w1 = await waterPlant(p.id, day(1))
    expect(w1.ok && w1.stageUp).toBe(true)
    expect(await waterPlant(p.id, day(1))).toEqual({ ok: false, reason: 'done' })
    await waterPlant(p.id, day(2))
    const w3 = await waterPlant(p.id, day(3))
    expect(w3.ok && w3.plant.stage).toBe(3)
    expect((await balance()).drop).toBe(2)

    const h = await harvestPlant(p.id, day(3))
    expect(h).toEqual({ coins: 8, harvestId: 'harvest-sunflower', firstTime: true })
    expect(await db.plants.count()).toBe(0)
    expect(await count('harvest-sunflower')).toBe(1)
    expect(await db.unlocks.where({ childId, kind: 'codex', refId: 'seed-sunflower' }).count()).toBe(1)
    expect((await progressStats(childId)).harvests).toBe(1)
  })

  it('没有水滴不能浇水', async () => {
    await plantSeed(childId, 'seed-strawberry', 3, 4, day(1))
    await db.ledger.add({ id: 'x', childId, at: day(1).toISOString(), currency: 'drop', amount: -5, reason: 'water' })
    const [p] = await db.plants.toArray()
    expect(await waterPlant(p.id, day(1))).toEqual({ ok: false, reason: 'drops' })
  })

  it('草莓可以卖，向日葵不能卖', async () => {
    await db.inventory.bulkAdd([
      { id: 'h1', childId, catalogId: 'harvest-strawberry', count: 1 },
      { id: 'h2', childId, catalogId: 'harvest-sunflower', count: 1 },
    ])
    expect(await sellHarvest(childId, 'harvest-strawberry', day(1))).toBe(true)
    expect((await balance()).coin).toBe(4)
    expect(await count('harvest-strawberry')).toBe(0)
    expect(await sellHarvest(childId, 'harvest-sunflower', day(1))).toBe(false)
  })

  it('铲除不退种子', async () => {
    await plantSeed(childId, 'seed-sunflower', 3, 4, day(1))
    const [p] = await db.plants.toArray()
    await digUp(p.id)
    expect(await db.plants.count()).toBe(0)
    expect(await count('seed-sunflower')).toBe(2)
  })
})

describe('扩建', () => {
  it('花 20 金币扩建相邻的空地', async () => {
    expect(await expandPlot(childId, 2, 4, day(1))).toEqual({ ok: false, reason: 'coins' })
    await giveBonus(childId, '测试', 25, day(1))
    expect(await expandPlot(childId, 0, 7, day(1))).toEqual({ ok: false, reason: 'invalid' })
    expect(await expandPlot(childId, 2, 4, day(1))).toEqual({ ok: true })
    expect(await db.plots.count()).toBe(7)
    expect((await balance()).coin).toBe(5)
  })
})
