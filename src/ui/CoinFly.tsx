import { useEffect, useRef, useState } from 'react'
import { useStore } from '../app/store'
import { play } from './sfx'
import { SvgArt } from './SvgArt'

interface Burst { key: number; n: number; amount: number; sx: number; sy: number; dx: number; dy: number }

/**
 * 金币到账动画：金币从屏幕中间飞进顶部的金币栏，“叮”一声（SPEC 4.4、7.4）。
 * 不挡点击，1.2 秒内结束。家长模式开着时先不播，等回到孩子界面再播（家长确认后的到账）。
 */
export function CoinFly() {
  const coin = useStore((s) => s.balance.coin)
  const parentOpen = useStore((s) => s.parentOpen)
  const prev = useRef<number | null>(null)
  const [burst, setBurst] = useState<Burst | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (parentOpen) return
    if (prev.current === null) {
      prev.current = coin
      return
    }
    const amount = coin - prev.current
    prev.current = coin
    if (amount <= 0) return
    const target = document.getElementById('coin-target')?.getBoundingClientRect()
    if (!target) return
    const sx = window.innerWidth / 2
    const sy = window.innerHeight / 2
    setBurst({
      key: Date.now(),
      n: Math.min(8, Math.max(3, Math.ceil(amount / 3))),
      amount,
      sx,
      sy,
      dx: target.left + target.width / 2 - sx,
      dy: target.top + target.height / 2 - sy,
    })
    play('coin')
    const pill = document.getElementById('coin-target')?.closest('.balance-pill')
    pill?.classList.remove('bump')
    void (pill as HTMLElement | undefined)?.offsetWidth
    pill?.classList.add('bump')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBurst(null), 1300)
  }, [coin, parentOpen])

  if (!burst) return null
  return (
    <div className="coin-fly" key={burst.key} aria-hidden>
      {Array.from({ length: burst.n }, (_, i) => {
        const ox = Math.cos((i / burst.n) * Math.PI * 2) * 40
        const oy = Math.sin((i / burst.n) * Math.PI * 2) * 40
        return (
          <span
            key={i}
            className="coin-fly-coin"
            style={{
              left: burst.sx + ox,
              top: burst.sy + oy,
              ['--dx' as string]: `${burst.dx - ox}px`,
              ['--dy' as string]: `${burst.dy - oy}px`,
              animationDelay: `${i * 0.04}s`,
            }}
          >
            <SvgArt id="coin" fluid />
          </span>
        )
      })}
      <span className="coin-fly-amount" style={{ left: burst.sx, top: burst.sy }}>+{burst.amount}</span>
    </div>
  )
}
