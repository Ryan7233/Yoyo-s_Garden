import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { giveBonus, setupChild } from './actions'
import { buyItem } from './garden'
import { applyStyle, flip, moveTo, placeFromInventory, putInVase, sellItem, storeBack } from './decorate'
import { addInventory } from './inventory'
import { balanceOf } from '../engine/ledger'

const NOW = new Date(2026, 9, 12, 18)
let childId = ''
const count = async (catalogId: string) => (await db.inventory.where({ childId, catalogId }).first())?.count ?? 0
const coins = async () => balanceOf(await db.ledger.where('childId').equals(childId).toArray()).coin

beforeEach(async () => {
  useDatabase(new GardenDB(`deco-${Math.random()}`))
  childId = (await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, NOW)).id
  await giveBonus(childId, '测试', 200, NOW)
})

describe('摆放', () => {
  it('买长椅摆到草地上，压到地块不行', async () => {
    await buyItem(childId, 'out-bench', NOW)
    expect(await placeFromInventory(childId, 'out-bench', 2, 4)).toBe(false) // (3,4) 是地块
    expect(await placeFromInventory(childId, 'out-bench', 6, 1)).toBe(true)
    expect(await count('out-bench')).toBe(0)
    const bench = (await db.placed.toArray()).find((p) => p.catalogId === 'out-bench')!
    expect(bench).toMatchObject({ scene: 'outdoor', layer: 'ground', x: 6, y: 1 })
  })

  it('移动、翻转、收回背包，刷新后布局保持', async () => {
    await buyItem(childId, 'in-sofa', NOW)
    await placeFromInventory(childId, 'in-sofa', 3, 0)
    const sofa = (await db.placed.toArray()).find((p) => p.catalogId === 'in-sofa')!
    expect(await moveTo(childId, sofa.id, 0, 3)).toBe(false) // 床在 (0,3)
    expect(await moveTo(childId, sofa.id, 4, 0)).toBe(true) // 和自己原来的位置重叠也可以
    await flip(sofa.id)
    expect(await db.placed.get(sofa.id)).toMatchObject({ x: 4, y: 0, flipped: true })
    await storeBack(sofa.id)
    expect(await db.placed.get(sofa.id)).toBeUndefined()
    expect(await count('in-sofa')).toBe(1)
  })

  it('挂件只能挂墙上', async () => {
    await buyItem(childId, 'in-clock', NOW)
    expect(await placeFromInventory(childId, 'in-clock', 2, 0)).toBe(true)
    expect((await db.placed.toArray()).find((p) => p.catalogId === 'in-clock')?.layer).toBe('wall')
  })

  it('室内盆栽种在地板上，可以移动', async () => {
    await buyItem(childId, 'seed-cactus', NOW)
    expect(await placeFromInventory(childId, 'seed-cactus', 4, 4, NOW)).toBe(true)
    const [cactus] = await db.plants.toArray()
    expect(cactus).toMatchObject({ scene: 'indoor', x: 4, y: 4, stage: 0 })
    expect(await moveTo(childId, cactus.id, 5, 4)).toBe(true)
  })
})

describe('花瓶、墙纸、卖家具', () => {
  it('鲜花插进花瓶，换一朵时旧的回背包；果实不能插', async () => {
    await addInventory(childId, 'harvest-sunflower', 1)
    await addInventory(childId, 'harvest-tulip', 1)
    await addInventory(childId, 'harvest-strawberry', 1)
    const vase = (await db.placed.toArray()).find((p) => p.catalogId === 'in-vase')!
    expect(await putInVase(vase.id, 'harvest-strawberry')).toBe(false)
    expect(await putInVase(vase.id, 'harvest-sunflower')).toBe(true)
    expect(await putInVase(vase.id, 'harvest-tulip')).toBe(true)
    expect((await db.placed.get(vase.id))?.content).toBe('harvest-tulip')
    expect(await count('harvest-sunflower')).toBe(1)
    expect(await count('harvest-tulip')).toBe(0)
  })

  it('墙纸买了才能换，买一次就够', async () => {
    expect(await applyStyle(childId, 'wall-stars')).toBe(false)
    expect(await buyItem(childId, 'wall-stars', NOW)).toEqual({ ok: true })
    expect(await buyItem(childId, 'wall-stars', NOW)).toEqual({ ok: false, reason: 'owned' })
    expect(await applyStyle(childId, 'wall-stars')).toBe(true)
    expect((await db.children.get(childId))?.wallStyle).toBe('wall-stars')
    expect(await applyStyle(childId, 'floor-wood')).toBe(true)
  })

  it('家具半价卖回，初始家具不能卖', async () => {
    await buyItem(childId, 'in-sofa', NOW)
    const before = await coins()
    expect(await sellItem(childId, 'in-sofa', NOW)).toBe(true)
    expect(await coins()).toBe(before + 30)
    await addInventory(childId, 'in-bed', 1)
    expect(await sellItem(childId, 'in-bed', NOW)).toBe(false)
  })
})
