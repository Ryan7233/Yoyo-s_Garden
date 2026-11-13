// 在最小花园格上预留触控范围；屏幕变宽时格子间距只会增加。
import type { Thing } from '../../engine/combos'
import { BALANCE } from '../../data/balance'
import { centerOf } from './projection'

const HALF_WIDTH = 44
const HALF_HEIGHT = 32
// 72px 的按钮，左右各留一点飞舞空间。
const SPACING = 84

interface Perch { u: number; v: number; offset: number }

export function visitorPerches() {
  const used: Perch[] = []

  function clearance(p: Perch) {
    return used.reduce((gap, other) => {
      const dx = (p.u + p.offset - other.u - other.offset) * HALF_WIDTH
      const dy = (p.v - other.v) * HALF_HEIGHT
      return Math.min(gap, Math.max(Math.abs(dx), Math.abs(dy)))
    }, Infinity)
  }

  return (candidates: Thing[]) => {
    if (!candidates.length) return undefined
    // 在同一类落脚点中先挑开阔的那个；只有花都挤在一起才挪到花旁边。
    let anchor = candidates[0]
    let gap = -1
    for (const t of candidates) {
      const space = clearance({ ...centerOf(t), offset: 0 })
      if (space > gap) { anchor = t; gap = space }
    }
    const center = centerOf(anchor)
    let perch = { ...center, offset: 0 }
    const maxX = (BALANCE.gridWidth + BALANCE.gridHeight) * HALF_WIDTH
    for (let step = 1; gap < SPACING && step <= used.length + 1; step++) {
      for (const side of [-1, 1]) {
        const offset = side * step * SPACING / HALF_WIDTH
        const x = (center.u + offset) * HALF_WIDTH
        if (x < 36 || x > maxX - 36) continue
        const candidate = { ...center, offset }
        const space = clearance(candidate)
        if (space > gap) { perch = candidate; gap = space }
      }
    }
    used.push(perch)
    return { anchor, offset: perch.offset }
  }
}
