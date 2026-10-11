import type { PlacedItem, Plot } from '../data/types'
import { BALANCE } from '../data/balance'

export interface Rect { x: number; y: number; w: number; h: number }

/** 小屋占的格子（室外左上角 3 × 3） */
export const HOUSE_RECT: Rect = { x: 0, y: 0, w: 3, h: 3 }

export function inRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h
}

/** 某格是否被小屋、地块或装饰占用 */
export function isOccupied(
  x: number, y: number, plots: Plot[], placed: (PlacedItem & { w?: number; h?: number })[],
): boolean {
  if (inRect(x, y, HOUSE_RECT)) return true
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
