import type { CatalogItem } from './types'
import { UNLOCKS } from './unlocks'

type Row = [id: string, icon: string, name: string, w: number, h: number, price: number, note?: string]

// 第 6.2 节户外装饰
const ROWS: Row[] = [
  ['path', 'svg:path', '石板小路', 1, 1, 2],
  ['rock', '🪨', '石头', 1, 1, 3],
  ['fence', '🪵', '木栅栏', 1, 1, 5],
  ['bucket', '🪣', '水桶', 1, 1, 5],
  ['picnic', '🧺', '野餐篮', 1, 1, 15],
  ['big-tree', 'svg:tree', '大树', 1, 1, 15, '纯装饰，不需要浇水'],
  ['street-lamp', '💡', '路灯', 1, 1, 20],
  ['scarecrow', 'svg:scarecrow', '稻草人', 1, 1, 20],
  ['birdhouse', '🏠', '鸟屋', 1, 1, 25, '吸引小鸟'],
  ['parasol', '⛱️', '遮阳伞', 1, 1, 25],
  ['bike', '🚲', '自行车', 1, 1, 30],
  ['bench', '🪑', '长椅', 2, 1, 30],
  ['beehive', '🍯', '蜂箱', 1, 1, 40, '吸引蜜蜂'],
  ['arch', 'svg:arch', '花拱门', 2, 1, 60],
  ['pond', 'svg:pond', '池塘', 2, 2, 80, '可种莲花，吸引青蛙'],
  ['tent', '⛺', '帐篷', 2, 2, 100],
  ['swing', 'svg:swing', '秋千', 2, 2, 120],
  ['slide', '🛝', '滑梯', 2, 2, 150],
  ['fountain', '⛲', '喷泉', 2, 2, 200],
]

export const OUTDOOR: CatalogItem[] = ROWS.map(([id, icon, name, w, h, price, note]) => ({
  id: `out-${id}`,
  kind: 'outdoor',
  name,
  icon,
  price,
  size: [w, h],
  note,
}))

export const OUTDOOR_SPECIAL: CatalogItem[] = [
  { id: 'out-golden-swing', kind: 'special', name: '金色秋千', icon: 'svg:golden-swing', price: 0, size: [2, 2], unlock: UNLOCKS['golden-swing'] },
  { id: 'out-star-lamp', kind: 'special', name: '星星路灯', icon: 'svg:star-lamp', price: 0, size: [1, 1], unlock: UNLOCKS['star-lamp'] },
]
