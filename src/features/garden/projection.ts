import type { CSSProperties } from 'react'
import { BALANCE } from '../../data/balance'
import type { Rect } from '../../engine/plots'

// Both axes use half a diamond as their unit. The leftmost map corner is (0, rows).
export function project(x: number, y: number) {
  return { u: BALANCE.gridHeight + x - y, v: x + y }
}

export function centerOf(r: Rect) {
  return project(r.x + r.w / 2, r.y + r.h / 2)
}

/** Bounding box and exact outline of a projected footprint, including rectangular furniture. */
export function gardenCell(x: number, y: number, w = 1, h = 1): CSSProperties {
  const { u, v } = project(x, y)
  const span = w + h
  const a = 100 * h / span
  const b = 100 * w / span
  return {
    left: `calc(var(--half-w) * ${u - h})`,
    top: `calc(var(--half-h) * ${v})`,
    width: `calc(var(--half-w) * ${span})`,
    height: `calc(var(--half-h) * ${span})`,
    '--footprint': `polygon(${a}% 0, 100% ${b}%, ${b}% 100%, 0 ${a}%)`,
    '--depth': 10 + (2 * v + span) * 4,
  } as CSSProperties
}
