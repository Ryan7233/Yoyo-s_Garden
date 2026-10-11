import type { CatalogItem } from './types'

type Row = [id: string, icon: string, name: string, wall: boolean, w: number, h: number, price: number, note?: string, starter?: boolean]

// 第 6.3 节室内家具
const ROWS: Row[] = [
  ['bed', '🛏️', '床', false, 2, 1, 0, undefined, true],
  ['chair', '🪑', '椅子', false, 1, 1, 0, undefined, true],
  ['vase', '🏺', '花瓶', false, 1, 1, 0, '可插收获的鲜花', true],
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
  { id: 'floor-wood', kind: 'floorStyle', name: '木地板', icon: 'svg:floor-wood', price: 0, size: [1, 1], starter: true },
  { id: 'floor-tile', kind: 'floorStyle', name: '浅色瓷砖', icon: 'svg:floor-tile', price: 20, size: [1, 1] },
  { id: 'wall-pink', kind: 'wallStyle', name: '粉色墙纸', icon: 'svg:wall-pink', price: 25, size: [1, 1] },
  { id: 'wall-green', kind: 'wallStyle', name: '草绿墙纸', icon: 'svg:wall-green', price: 25, size: [1, 1] },
  { id: 'wall-stars', kind: 'wallStyle', name: '星空墙纸', icon: 'svg:wall-stars', price: 40, size: [1, 1] },
]
