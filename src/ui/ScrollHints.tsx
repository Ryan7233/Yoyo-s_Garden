import { useEffect, useRef, useState } from 'react'
import './scrollHints.css'

type Dir = 'up' | 'down' | 'left' | 'right'
const DIRS: Dir[] = ['up', 'down', 'left', 'right']
const ARROW: Record<Dir, string> = { up: '▲', down: '▼', left: '◀', right: '▶' }
/** 那一侧藏着的内容少于这个值时不提示（几像素的余量不值得提醒孩子去滑） */
export const HINT_MIN_HIDDEN = 24

/**
 * 场景可以滑动时的提示：可滑的一侧边缘渐隐，加一个小箭头；滑到头就消失。
 * 放在滑动容器（.scene-scroll）的前面，盖在它上面，不接收点击。
 */
export function ScrollHints() {
  const ref = useRef<HTMLDivElement>(null)
  const [can, setCan] = useState<Record<Dir, boolean>>({ up: false, down: false, left: false, right: false })

  useEffect(() => {
    const el = ref.current?.nextElementSibling as HTMLElement | null
    if (!el) return
    const update = () => {
      const m = HINT_MIN_HIDDEN
      const next = {
        up: el.scrollTop >= m,
        down: el.scrollHeight - el.clientHeight - el.scrollTop >= m,
        left: el.scrollLeft >= m,
        right: el.scrollWidth - el.clientWidth - el.scrollLeft >= m,
      }
      setCan((prev) => (DIRS.every((d) => prev[d] === next[d]) ? prev : next))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className="scroll-hints" aria-hidden>
      {DIRS.filter((d) => can[d]).map((d) => (
        <span key={d} className={`scroll-hint ${d}`}>
          <span className="scroll-hint-arrow">{ARROW[d]}</span>
        </span>
      ))}
    </div>
  )
}
