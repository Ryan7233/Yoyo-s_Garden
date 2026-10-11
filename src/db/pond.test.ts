import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { giveBonus, setupChild } from './actions'
import { buyItem, plantInPond, plantSeed, waterPlant } from './garden'
import { moveTo, placeFromInventory, storeBack } from './decorate'
import { addInventory } from './inventory'
import { syncProgress } from './progress'

const NOW = new Date(2026, 9, 12, 18)
let childId = ''
let pondId = ''

beforeEach(async () => {
  useDatabase(new GardenDB(`pond-${Math.random()}`))
  childId = (await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, NOW)).id
  await giveBonus(childId, '测试', 200, NOW)
  await buyItem(childId, 'out-pond', NOW)
  expect(await placeFromInventory(childId, 'out-pond', 7, 1)).toBe(true)
  pondId = (await db.placed.toArray()).find((p) => p.catalogId === 'out-pond')!.id
})

describe('池塘种植', () => {
  it('莲花只能种在池塘，一个池塘一株', async () => {
    await buyItem(childId, 'seed-lotus', NOW)
    await buyItem(childId, 'seed-lotus', NOW)
    expect(await plantSeed(childId, 'seed-lotus', 3, 4)).toBe(false)
    expect(await plantInPond(childId, 'seed-sunflower', pondId)).toBe(false)
    expect(await plantInPond(childId, 'seed-lotus', pondId, NOW)).toBe(true)
    expect(await plantInPond(childId, 'seed-lotus', pondId, NOW)).toBe(false)
    const lotus = (await db.plants.toArray()).find((p) => p.catalogId === 'seed-lotus')!
    expect(lotus).toMatchObject({ scene: 'outdoor', x: 7, y: 1, pondId, stage: 0 })
    expect((await waterPlant(lotus.id, NOW)).ok).toBe(true)
  })

  it('水晶莲解锁送的种子也能种进池塘', async () => {
    await addInventory(childId, 'seed-crystal-lotus', 1)
    expect(await plantInPond(childId, 'seed-crystal-lotus', pondId, NOW)).toBe(true)
  })

  it('移动池塘时植物跟着走；种着植物的池塘不能收回', async () => {
    await buyItem(childId, 'seed-lotus', NOW)
    await plantInPond(childId, 'seed-lotus', pondId, NOW)
    expect(await moveTo(childId, pondId, 8, 6)).toBe(true)
    const lotus = (await db.plants.toArray()).find((p) => p.catalogId === 'seed-lotus')!
    expect([lotus.x, lotus.y]).toEqual([8, 6])
    expect(await storeBack(pondId)).toEqual({ ok: false, reason: 'pondPlanted' })
    expect(await db.placed.get(pondId)).toBeTruthy()
  })

  it('池塘吸引青蛙', async () => {
    const g = await syncProgress(childId, NOW)
    expect(g.visitors).toContain('frog')
  })
})
