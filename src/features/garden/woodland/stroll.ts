import type { PlacedItem, PlantInstance, Plot } from '../../../data/types'
import { BALANCE } from '../../../data/balance'
import { getCatalogItem } from '../../../data/catalog'
import { HOUSE_RECT, ORCHARD_RECT, inRect } from '../../../engine/plots'
import { footprintOf } from '../../../engine/placement'
import type { Stop } from './world'

type Cell = { x: number; y: number }
const W = BALANCE.gridWidth,
  H = BALANCE.gridHeight
const at = (c: Cell) => c.y * W + c.x
const NEAR: Cell[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

/**
 * A walk for the mascot over open grass: from the cottage door, past anything that needs her,
 * round the garden and back. It goes around the house, beds, the orchard and furniture
 * (paths and other floor tiles are fine to walk on). Returns nothing if there is nowhere to go.
 */
export function stroll(plots: Plot[], placed: PlacedItem[], visit: PlantInstance[]): Stop[] {
  const blocked = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (inRect(x, y, HOUSE_RECT) || inRect(x, y, ORCHARD_RECT)) blocked[y * W + x] = 1
  for (const p of plots) blocked[at(p)] = 1
  for (const p of placed) {
    const item = p.scene === 'outdoor' && getCatalogItem(p.catalogId)
    if (!item) continue
    const f = footprintOf(item, p.x, p.y)
    if (f.tile) continue
    for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) if (x >= 0 && y >= 0 && x < W && y < H) blocked[y * W + x] = 1
  }
  const inside = (c: Cell) => c.x >= 0 && c.y >= 0 && c.x < W && c.y < H
  /** Shortest way over free cells from `from` to the first cell `done` accepts, or null. */
  const search = (from: Cell, done: (c: Cell) => boolean, through = false): Cell[] | null => {
    const prev = new Int32Array(W * H).fill(-2)
    const queue = [from]
    prev[at(from)] = -1
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i]
      if (done(c)) {
        const path: Cell[] = []
        for (let k = at(c); k !== -1; k = prev[k]) path.unshift({ x: k % W, y: Math.floor(k / W) })
        return path
      }
      for (const d of NEAR) {
        const n = { x: c.x + d.x, y: c.y + d.y }
        if (!inside(n) || prev[at(n)] !== -2 || (!through && blocked[at(n)])) continue
        prev[at(n)] = at(c)
        queue.push(n)
      }
    }
    return null
  }
  const free = (near: Cell) => search(near, (c) => !blocked[at(c)], true)?.at(-1)
  const goals: (Cell & { stay: number })[] = []
  const door = free({ x: 1, y: 3 })
  if (!door) return []
  goals.push({ ...door, stay: 2.5 })
  // Stand next to up to two plants that need something, for a good long look.
  for (const p of visit.slice(0, 2)) {
    const beside = NEAR.map((d) => ({ x: p.x + d.x, y: p.y + d.y })).find((c) => inside(c) && !blocked[at(c)])
    if (beside) goals.push({ ...beside, stay: 5 })
  }
  for (const spot of [
    { x: 7, y: 3 },
    { x: 11, y: 4 },
    { x: 6, y: 7 },
  ]) {
    const c = free(spot)
    if (c) goals.push({ ...c, stay: 2.5 })
  }
  const stops: Stop[] = []
  for (let i = 0; i < goals.length; i++) {
    const from = goals[i],
      to = goals[(i + 1) % goals.length]
    const path = search(from, (c) => c.x === to.x && c.y === to.y)
    if (!path) return []
    path.slice(0, -1).forEach((c, k) => stops.push({ x: c.x + 0.5, y: 0.02, z: c.y + 0.5, stay: k ? 0 : from.stay }))
  }
  return stops.length > 1 ? stops : []
}
