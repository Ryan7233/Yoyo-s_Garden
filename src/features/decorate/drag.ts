import type { PointerEvent as ReactPointerEvent } from 'react'
import { cellAt, useDecorate, type Cell, type Holding } from './useDecorate'

const DRAG_THRESHOLD = 10

/**
 * 按下一个物品：拖动超过阈值就是拖拽，松手时放到手指下的格子；
 * 没怎么动就是“点一下”，交给 onTap（拖拽和点放两种方式都可用）。
 */
export function startPress(
  e: ReactPointerEvent,
  holding: Holding,
  onDrop: (cell: Cell, h: Holding) => void,
  onTap: () => void,
) {
  const sx = e.clientX
  const sy = e.clientY
  let dragging = false
  const st = useDecorate.getState()

  const move = (ev: PointerEvent) => {
    if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > DRAG_THRESHOLD) {
      dragging = true
      st.hold(holding)
      st.setDragging(true)
    }
    if (dragging) {
      ev.preventDefault()
      useDecorate.getState().setHover(cellAt(ev.clientX, ev.clientY))
    }
  }
  const up = (ev: PointerEvent) => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    if (!dragging) {
      onTap()
      return
    }
    const cell = cellAt(ev.clientX, ev.clientY)
    const s = useDecorate.getState()
    s.setDragging(false)
    s.setHover(null)
    if (cell) onDrop(cell, holding)
    else s.hold(null)
  }
  window.addEventListener('pointermove', move, { passive: false })
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
}
