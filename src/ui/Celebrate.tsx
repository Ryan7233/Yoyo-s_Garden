import { useEffect, useState } from 'react'

const PETALS = ['🌸', '⭐', '🌼', '✨', '🌷', '⭐', '🌸', '✨']

/** 花瓣和星星飘落，1.2 秒后消失；不挡点击，孩子可以直接做下一步 */
export function Celebrate() {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 1200)
    return () => clearTimeout(t)
  }, [])
  if (!on) return null
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', overflow: 'hidden' }}>
      {PETALS.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${10 + i * 11}%`,
            top: `${20 + (i % 3) * 12}%`,
            fontSize: 40,
            animation: `petal-fall 1.2s ease-in ${i * 0.04}s both`,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  )
}
