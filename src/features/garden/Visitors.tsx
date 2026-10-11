import { useEffect, useState } from 'react'
import { useStore } from '../../app/store'
import { VISITORS, type VisitorDef } from '../../data/visitors'
import { presentVisitors, snapshotOf } from '../../engine/visitors'
import './visitors.css'

// 每位访客固定的落脚点（相对场景的百分比），避开左上角的小屋；会飞的在高处
const SPOTS: Record<string, { left: number; top: number; fly?: boolean }> = {
  butterfly: { left: 46, top: 22, fly: true },
  bird: { left: 70, top: 12, fly: true },
  bee: { left: 58, top: 30, fly: true },
  ladybug: { left: 36, top: 78 },
  rabbit: { left: 68, top: 74 },
  frog: { left: 62, top: 84 },
  squirrel: { left: 88, top: 38 },
  hedgehog: { left: 22, top: 86 },
  cat: { left: 70, top: 62 },
}

/** 条件满足时出现的小动物：从边上蹦进来，点一下会跳一下并说一句话 */
export function Visitors({ scene }: { scene: 'outdoor' | 'indoor' }) {
  const { plants, placed, ledger, decorating } = useStore()
  const [talking, setTalking] = useState<string | null>(null)
  useEffect(() => {
    if (!talking) return
    const t = setTimeout(() => setTalking(null), 3000)
    return () => clearTimeout(t)
  }, [talking])
  if (decorating) return null
  const here = presentVisitors(VISITORS, snapshotOf(plants, placed, ledger)).filter((v) => v.scene === scene)
  return (
    <div className="visitors">
      {here.map((v, i) => (
        <Visitor key={v.id} v={v} delay={i * 0.25} talking={talking === v.id} onTap={() => setTalking(v.id)} />
      ))}
    </div>
  )
}

function Visitor({ v, delay, talking, onTap }: { v: VisitorDef; delay: number; talking: boolean; onTap: () => void }) {
  const spot = SPOTS[v.id] ?? { left: 50, top: 50 }
  const [hop, setHop] = useState(0)
  return (
    <button
      className="visitor"
      style={{ left: `${spot.left}%`, top: `${spot.top}%`, animationDelay: `${delay}s` }}
      aria-label={v.name}
      onClick={() => {
        setHop((n) => n + 1)
        onTap()
      }}
    >
      <span className={`visitor-move${spot.fly ? ' fly' : ''}`}>
        <span key={hop} className={`visitor-body${hop ? ' hop' : ''}`}>{v.icon}</span>
      </span>
      {talking && <span className="visitor-say pop">{v.name}：{v.line}</span>}
    </button>
  )
}
