import type { CatalogItem, PlantSpec } from './types'
import { BALANCE } from './balance'
import { UNLOCKS } from './unlocks'

type Row = [id: string, icon: string, name: string, price: number, water: number, regrow: number | null, harvest: number, needs?: PlantSpec['needs'], note?: string]

// 第 6.1 节植物表。regrow 为 null 表示一次性；0 表示多年生纯观赏
const ROWS: Row[] = [
  ['sunflower', '🌻', '向日葵', 5, 3, null, 8, 'soil', '吸引小鸟'],
  ['daisy', '🌼', '雏菊', 5, 3, null, 8],
  ['tulip', '🌷', '郁金香', 8, 4, null, 12],
  ['hyacinth', '🪻', '风信子', 10, 4, null, 14],
  ['hibiscus', '🌺', '扶桑花', 12, 5, null, 16],
  ['rose', '🌹', '玫瑰', 15, 6, 3, 10],
  ['lotus', '🪷', '莲花', 20, 6, 3, 10, 'pond', '只能种在池塘'],
  ['strawberry', '🍓', '草莓', 5, 3, null, 8],
  ['carrot', '🥕', '胡萝卜', 6, 3, null, 10, 'soil', '吸引小兔'],
  ['tomato', '🍅', '番茄', 8, 4, null, 12],
  ['corn', '🌽', '玉米', 10, 5, null, 15],
  ['pumpkin', '🎃', '南瓜', 15, 6, null, 22],
  ['watermelon', '🍉', '西瓜', 20, 7, null, 30],
  ['apple-tree', '🍎', '苹果树', 30, 10, 3, 6, 'soil', '吸引松鼠'],
  ['orange-tree', '🍊', '橘子树', 30, 10, 3, 6],
  ['peach-tree', '🍑', '桃树', 35, 10, 3, 7],
  ['cherry-tree', '🌸', '樱花树', 40, 12, 0, 0, 'soil', '纯观赏'],
  ['pine-tree', '🌲', '松树', 25, 8, 0, 0, 'soil', '纯观赏'],
  ['cactus', '🌵', '仙人掌', 10, 4, 0, 0, 'indoor'],
  ['pothos', '🪴', '绿萝', 12, 4, 0, 0, 'indoor'],
  ['bamboo', '🎋', '竹子', 15, 5, 0, 0, 'indoor'],
  ['mushroom', '🍄', '小蘑菇', 8, 3, 0, 0, 'indoor'],
]

export const FLOWER_IDS = ['sunflower', 'daisy', 'tulip', 'hyacinth', 'hibiscus', 'rose', 'lotus'].map((s) => `seed-${s}`)
export const VEGGIE_IDS = ['strawberry', 'carrot', 'tomato', 'corn', 'pumpkin', 'watermelon'].map((s) => `seed-${s}`)
export const FRUIT_TREE_IDS = ['apple-tree', 'orange-tree', 'peach-tree'].map((s) => `seed-${s}`)

export const SEEDS: CatalogItem[] = ROWS.map(([id, icon, name, price, water, regrow, harvest, needs = 'soil', note]) => ({
  id: `seed-${id}`,
  kind: 'seed',
  name,
  icon,
  price,
  size: [1, 1],
  note,
  plant: {
    waterToMature: water,
    perennial: regrow !== null,
    regrowWater: regrow ?? undefined,
    harvestCoins: harvest,
    harvestItem: harvest > 0 || regrow === null ? `harvest-${id}` : undefined,
    needs,
  },
}))

// 特殊植物（5.7）：SVG 绘制，解锁后在“特殊”分类出售
const SPECIAL: [id: string, name: string, unlockId: keyof typeof UNLOCKS, needs?: PlantSpec['needs']][] = [
  ['rainbow-flower', '彩虹花', 'rainbow-flower'],
  ['book-flower', '书页花', 'book-flower'],
  ['note-flower', '音符花', 'note-flower'],
  ['star-tree', '星星树', 'star-tree'],
  ['crystal-lotus', '水晶莲', 'crystal-lotus', 'pond'],
]

export const SPECIAL_SEEDS: CatalogItem[] = SPECIAL.map(([id, name, unlockId, needs = 'soil']) => ({
  id: `seed-${id}`,
  kind: 'special',
  name,
  icon: `svg:${id}`,
  price: BALANCE.specialSeedPrice,
  size: [1, 1],
  unlock: UNLOCKS[unlockId],
  plant: {
    waterToMature: BALANCE.specialWaterToMature,
    perennial: false,
    harvestCoins: BALANCE.specialHarvestCoins,
    harvestItem: `harvest-${id}`,
    needs,
  },
}))

export interface HarvestInfo {
  id: string
  seedId: string
  name: string
  icon: string
  /** 鲜花插花瓶，果实可以卖 */
  kind: 'flower' | 'fruit'
  sellPrice: number
}

const FRUIT_SEEDS = new Set([...VEGGIE_IDS, ...FRUIT_TREE_IDS])

/** 收获物信息：harvest-xxx → 名字、图标、能否出售 */
export function harvestInfo(harvestId: string): HarvestInfo | undefined {
  const seed = [...SEEDS, ...SPECIAL_SEEDS].find((s) => s.plant?.harvestItem === harvestId)
  if (!seed?.plant) return undefined
  const kind = FRUIT_SEEDS.has(seed.id) ? 'fruit' : 'flower'
  const name = seed.id.endsWith('-tree') ? seed.name.replace(/树$/, '') : seed.name
  return {
    id: harvestId,
    seedId: seed.id,
    name,
    icon: seed.icon,
    kind,
    sellPrice: kind === 'fruit' ? Math.ceil(seed.plant.harvestCoins * BALANCE.fruitSellRatio) : 0,
  }
}

/** 一颗种子能否种在室外泥土地块 */
export function plantableOutdoors(item: CatalogItem): boolean {
  return item.plant?.needs === 'soil'
}

/** 一颗种子能否种在池塘（莲花、水晶莲） */
export function plantableInPond(item: CatalogItem): boolean {
  return item.plant?.needs === 'pond'
}

export const POND_ID = 'out-pond'
