import type { CatalogItem } from './types'

type Row = [id: string, icon: string, name: string, wall: boolean, w: number, h: number, price: number, note?: string, starter?: boolean]

// 第 6.3 节室内家具
const ROWS: Row[] = [
  ['bed', 'svg:bed', '床', false, 2, 1, 0, undefined, true],
  ['chair', 'svg:chair', '椅子', false, 1, 1, 0, undefined, true],
  ['vase', 'svg:vase', '花瓶', false, 1, 1, 0, '可插收获的鲜花', true],
  ['teddy', '🧸', '玩具熊', false, 1, 1, 15],
  ['desk-lamp', '💡', '台灯', false, 1, 1, 15],
  ['radio', '📻', '收音机', false, 1, 1, 30],
  ['rug', 'svg:rug', '地毯', false, 2, 2, 30, 'CSS 绘制，可选颜色'],
  ['bookshelf', '📚', '书架', false, 1, 1, 35],
  ['desk', 'svg:desk', '书桌', false, 2, 1, 40],
  ['easel', '🎨', '画架', false, 1, 1, 40],
  ['sing-corner', '🎤', '唱歌角', false, 1, 1, 40, '点一下播放一小段音效'],
  ['guitar', '🎸', '吉他', false, 1, 1, 50],
  ['sofa', '🛋️', '沙发', false, 2, 1, 60, '吸引小猫'],
  ['fish-tank', '🐠', '鱼缸', false, 1, 1, 60, '里面有金鱼游动'],
  ['piano', '🎹', '钢琴', false, 2, 1, 150],
  ['painting', '🖼️', '挂画', true, 1, 1, 20],
  ['clock', '🕰️', '挂钟', true, 1, 1, 20, '显示真实时间'],
  ['mirror', '🪞', '镜子', true, 1, 1, 20],
  ['window', '🪟', '窗户', true, 1, 1, 25, '窗外能看到花园'],
]

export const INDOOR: CatalogItem[] = ROWS.map(([id, icon, name, wall, w, h, price, note, starter]) => ({
  id: `in-${id}`,
  kind: wall ? 'wall' : 'indoor',
  name,
  icon,
  price,
  size: [w, h],
  note,
  starter,
}))

export const STYLES: CatalogItem[] = [
  { id: 'wall-default', kind: 'wallStyle', name: '浅粉条纹', icon: 'svg:wall-default', price: 0, size: [1, 1], starter: true },
  { id: 'floor-wood', kind: 'floorStyle', name: '木地板', icon: 'svg:floor-wood', price: 0, size: [1, 1], starter: true },
  { id: 'floor-tile', kind: 'floorStyle', name: '浅色瓷砖', icon: 'svg:floor-tile', price: 20, size: [1, 1] },
  { id: 'wall-pink', kind: 'wallStyle', name: '粉色墙纸', icon: 'svg:wall-pink', price: 25, size: [1, 1] },
  { id: 'wall-green', kind: 'wallStyle', name: '草绿墙纸', icon: 'svg:wall-green', price: 25, size: [1, 1] },
  { id: 'wall-stars', kind: 'wallStyle', name: '星空墙纸', icon: 'svg:wall-stars', price: 40, size: [1, 1] },
]

/** 地面图块：其他物品可以叠放在上面 */
export const TILE_IDS = new Set(['out-path', 'in-rug'])

/** 墙纸和地板的 CSS 背景 */
export const STYLE_CSS: Record<string, string> = {
  'wall-default': 'repeating-linear-gradient(90deg, transparent 0 38px, rgba(255, 158, 192, 0.18) 38px 42px), #ffe6ef',
  'wall-pink': 'radial-gradient(circle at 20px 20px, #ffc4d8 0 5px, transparent 6px) 0 0 / 40px 40px, #ffe6ef',
  'wall-green': 'radial-gradient(circle at 20px 20px, #bfeccf 0 5px, transparent 6px) 0 0 / 40px 40px, #e3f7ef',
  'wall-stars': 'radial-gradient(circle at 12px 14px, #ffd66b 0 2.5px, transparent 3.5px) 0 0 / 46px 38px, radial-gradient(circle at 32px 28px, #fff 0 2px, transparent 3px) 0 0 / 46px 38px, #4b3d7a',
  'floor-wood': 'repeating-linear-gradient(0deg, transparent 0 46px, rgba(185, 138, 94, 0.35) 46px 48px), #e9c49b',
  'floor-tile': 'linear-gradient(90deg, rgba(217,211,220,.7) 2px, transparent 2px) 0 0 / 56px 56px, linear-gradient(0deg, rgba(217,211,220,.7) 2px, transparent 2px) 0 0 / 56px 56px, #f8f5f1',
}
