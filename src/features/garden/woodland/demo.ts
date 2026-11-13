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
