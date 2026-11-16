import { db, GardenDB, useDatabase } from '../../../db/schema'
import { setupChild } from '../../../db/actions'
import { syncProgress, markUnlocksSeen } from '../../../db/progress'
import { getCatalogItem } from '../../../data/catalog'
import type { PlantInstance } from '../../../data/types'

/** This URL always opens its own database, including when a real garden already exists. */
export async function prepareWoodDemo() {
  useDatabase(new GardenDB('little-garden-wood-demo-v1'))
  const child =
    (await db.children.toCollection().first()) ??
    (await setupChild({
      name: 'Yoyo',
      gardenName: '木作花园 · 试玩',
      theme: 'sakura',
      houseColor: '#d98a9d',
      mascotName: '团团',
      pin: '0000',
    }))
  const childId = child.id
  const at = new Date().toISOString()
  const seeds = [
    'sunflower',
    'daisy',
    'sunflower',
    'tulip',
    'sunflower',
    'rose',
    'strawberry',
    'hyacinth',
    'tomato',
    'daisy',
    'carrot',
    'pumpkin',
    'tulip',
    'hibiscus',
    null,
  ]
  const props: [string, number, number][] = [
    ['pond', 8, 1],
    ['bench', 6, 1],
    ['scarecrow', 7, 3],
    ['birdhouse', 3, 1],
    ['beehive', 10, 4],
    ['fence', 4, 1],
    ['fence', 5, 1],
    ['bucket', 2, 5],
    ['picnic', 8, 6],
  ]
  await db.transaction('rw', [db.plots, db.plants, db.placed, db.ledger], async () => {
    if (await db.ledger.get('wood-demo-gift')) return
    for (let i = 0; i < seeds.length; i++) {
      const x = 3 + (i % 5),
        y = 4 + Math.floor(i / 5)
      await db.plots.put({ childId, x, y, kind: 'soil' })
      const seed = seeds[i]
      if (!seed) continue
      const catalogId = 'seed-' + seed
      const stage: PlantInstance['stage'] = i === 12 ? 1 : 3
      await db.plants.put({
        id: 'flower-' + i,
        childId,
        x,
        y,
        scene: 'outdoor',
        catalogId,
        stage,
        waterCount: stage === 3 ? getCatalogItem(catalogId)!.plant!.waterToMature : 2,
        plantedAt: at,
      })
    }
    // 果园：熟了的苹果、开花的桃树、挂青果的橘子、樱花，还有一棵刚长起来的小桃树
    const trees: [string, number, number, PlantInstance['stage'], number?][] = [
      ['apple-tree', 12, 0, 3],
      ['peach-tree', 14, 0, 3, 11],
      ['orange-tree', 12, 2, 3, 12],
      ['cherry-tree', 14, 2, 3],
      ['peach-tree', 12, 4, 3],
      ['apple-tree', 14, 4, 2],
    ]
    for (const [kind, x, y, stage, water] of trees) {
      const catalogId = 'seed-' + kind
      const grown = getCatalogItem(catalogId)!.plant!.waterToMature
      await db.plants.put({
        id: 'tree-' + x + '-' + y,
        childId,
        x,
        y,
        scene: 'outdoor',
        catalogId,
        stage,
        waterCount: stage === 3 ? (water ?? grown) : grown - 2,
        lastHarvestWater: water ? grown : undefined,
        plantedAt: at,
      })
    }
    for (const [kind, x, y] of props)
      await db.placed.put({
        id: 'toy-' + kind + '-' + x,
        childId,
        x,
        y,
        scene: 'outdoor',
        layer: 'ground',
        catalogId: 'out-' + kind,
        flipped: false,
      })
    await db.ledger.put({
      id: 'wood-demo-gift',
      childId,
      at,
      date: at.slice(0, 10),
      currency: 'coin',
      amount: 120,
      reason: 'gift',
    })
  })
  await syncProgress(childId)
  await markUnlocksSeen((await db.unlocks.toArray()).filter((u) => !u.seenAt).map((u) => u.id))
}
