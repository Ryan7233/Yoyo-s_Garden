import type { PlacedItem, PlantInstance, Plot } from '../data/types'
import { BALANCE } from '../data/balance'

export interface Rect { x: number; y: number; w: number; h: number }

/** 小屋占的格子（室外左上角 3 × 3） */
export const HOUSE_RECT: Rect = { x: 0, y: 0, w: 3, h: 3 }

/**
 * 果园：花园右边 4 列整片留给果树。每个树坑 2 × 2，一共 2 列 × 4 行 = 8 个，
 * 树种在草地上，不种在花菜的木框菜畦里。树坑固定，不用开，空坑就等着种树。
 */
export const ORCHARD_RECT: Rect = { x: 12, y: 0, w: 4, h: 8 }
export const ORCHARD_PITS: Rect[] = Array.from({ length: 8 }, (_, i) => ({
  x: ORCHARD_RECT.x + (i % 2) * 2,
  y: ORCHARD_RECT.y + Math.floor(i / 2) * 2,
  w: 2,
  h: 2,
}))
/** (x, y) 所在的树坑；树和树坑都记在左上角那一格 */
export function pitAt(x: number, y: number): Rect | undefined {
  return ORCHARD_PITS.find((r) => inRect(x, y, r))
}
/** 种在果园里的树占 2 × 2，池塘里的花跟着池塘占 2 × 2，其余植物占 1 格 */
export function plantRect(p: Pick<PlantInstance, 'x' | 'y' | 'pondId'>): Rect {
  const pit = pitAt(p.x, p.y)
  const big = !!p.pondId || (pit?.x === p.x && pit.y === p.y)
  return { x: p.x, y: p.y, w: big ? 2 : 1, h: big ? 2 : 1 }
}

export function inRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h
}

/** 某格是否被小屋、地块或装饰占用 */
export function isOccupied(
  x: number, y: number, plots: Plot[], placed: (PlacedItem & { w?: number; h?: number })[],
): boolean {
  if (inRect(x, y, HOUSE_RECT) || inRect(x, y, ORCHARD_RECT)) return true
  if (plots.some((p) => p.x === x && p.y === y)) return true
  return placed.some((p) => inRect(x, y, { x: p.x, y: p.y, w: p.w ?? 1, h: p.h ?? 1 }))
}

/** 可以扩建的格子：紧挨现有泥土地块、在网格内、没有被占用 */
export function expandCandidates(plots: Plot[], placed: (PlacedItem & { w?: number; h?: number })[]): { x: number; y: number }[] {
  const soil = plots.filter((p) => p.kind === 'soil')
  if (soil.length >= BALANCE.maxPlots) return []
  const seen = new Set<string>()
  const out: { x: number; y: number }[] = []
  for (const p of soil) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = p.x + dx
      const y = p.y + dy
      const key = `${x},${y}`
      if (seen.has(key)) continue
      seen.add(key)
      if (x < 0 || y < 0 || x >= BALANCE.gridWidth || y >= BALANCE.gridHeight) continue
      if (isOccupied(x, y, plots, placed)) continue
      out.push({ x, y })
    }
  }
  return out
}

/** 初始 6 块地（2 × 3），放在花园中间偏左 */
export function starterPlots(childId: string): Plot[] {
  const out: Plot[] = []
  for (let y = 4; y < 6; y++) for (let x = 3; x < 6; x++) out.push({ childId, x, y, kind: 'soil' })
  return out
}
