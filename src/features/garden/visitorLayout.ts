// 在最小花园格上预留触控范围；屏幕变宽时格子间距只会增加。
import type { Thing } from '../../engine/combos'
import { BALANCE } from '../../data/balance'

// 72px 的按钮，左右各留一点飞舞空间。
const SPACING = 84

interface Perch { u: number; v: number; offset: number }

export function visitorPerches(view: 'flat' | 'wood') {
  const unitX = view === 'flat' ? 64 : 44
  const unitY = view === 'flat' ? 64 : 32
  const maxX = (BALANCE.gridWidth + (view === 'wood' ? BALANCE.gridHeight : 0)) * unitX
  function centerOf(t: Thing) {
    const x = t.x + t.w / 2, y = t.y + t.h / 2
    return view === 'flat' ? { u: x, v: y } : { u: BALANCE.gridHeight + x - y, v: x + y }
  }
  const used: Perch[] = []

  function clearance(p: Perch) {
    return used.reduce((gap, other) => {
      const dx = (p.u + p.offset - other.u - other.offset) * unitX
      const dy = (p.v - other.v) * unitY
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
    for (let step = 1; gap < SPACING && step <= used.length + 1; step++) {
      for (const side of [-1, 1]) {
        const offset = side * step * SPACING / unitX
        const x = (center.u + offset) * unitX
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
