import { useEffect, useState, type CSSProperties } from 'react'
import { useStore } from '../../app/store'
import { VISITORS, type VisitorDef } from '../../data/visitors'
import { closestFlower, presentVisitors, snapshotOf, visitorAnchors } from '../../engine/visitors'
import { thingsOf } from '../../engine/combos'
import { centerOf, gardenCell } from './projection'
import { visitorPerches } from './visitorLayout'
import './visitors.css'
import { play } from '../../ui/sfx'

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

function useTalking() {
  const [talking, setTalking] = useState<string | null>(null)
  useEffect(() => {
    if (!talking) return
    const t = setTimeout(() => setTalking(null), 3000)
    return () => clearTimeout(t)
  }, [talking])
  return [talking, setTalking] as const
}

/** 现在在场的访客，分成落在花园某样东西旁边的（anchor）和用固定位置的 */
function useHere(scene: 'outdoor' | 'indoor') {
  const { plants, placed, ledger } = useStore()
  const things = scene === 'outdoor' ? thingsOf(plants, placed) : []
  const pickPerch = visitorPerches()
  return presentVisitors(VISITORS, snapshotOf(plants, placed, ledger))
    .filter((v) => v.scene === scene)
    .map(v => {
      const perch = pickPerch(visitorAnchors(v, things))
      const anchor = perch?.anchor
      const flower = v.id === 'bee' && anchor?.catalogId === 'out-beehive' ? closestFlower(anchor, things) : undefined
      return { v, anchor, offset: perch?.offset ?? 0, flower }
    })
}

/** 条件满足时出现的小动物：从边上蹦进来，点一下会跳一下并说一句话。这里只放没有落脚点的 */
export function Visitors({ scene }: { scene: 'outdoor' | 'indoor' }) {
  const decorating = useStore((s) => s.decorating)
  const [talking, setTalking] = useTalking()
  const here = useHere(scene).filter((h) => !h.anchor)
  if (decorating) return null
  return (
    <div className="visitors">
      {here.map(({ v }, i) => {
        const spot = SPOTS[v.id] ?? { left: 50, top: 50 }
        return <Visitor key={v.id} v={v} fly={spot.fly} style={{ left: `${spot.left}%`, top: `${spot.top}%` }} delay={i * 0.25} talking={talking === v.id} onTap={() => setTalking(v.id)} />
      })}
    </div>
  )
}

/** 落在吸引它的东西旁边的访客：蜂箱摆哪儿，蜜蜂就在哪儿。放在地面网格里，跟着格子走 */
export function AnchoredVisitors() {
  const decorating = useStore((s) => s.decorating)
  const [talking, setTalking] = useTalking()
  const here = useHere('outdoor').filter((h) => h.anchor)
  if (decorating) return null
  return (
    <>
      {here.map(({ v, anchor, flower, offset }, i) => {
        if (!anchor) return null
        const from = centerOf(anchor)
        const to = flower && centerOf(flower)
        const flight = to && {
          '--flight-x': `calc(var(--half-w) * ${to.u - from.u})`,
          '--flight-y': `calc(var(--half-h) * ${to.v - from.v})`,
        }
        return (
          <div key={v.id} className={`visitor-spot${flight ? ' nectar-flight' : ''}`}
            style={{ ...gardenCell(anchor.x, anchor.y, anchor.w, anchor.h), ...flight }}>
            <Visitor v={v} fly={SPOTS[v.id]?.fly} style={{ left: `calc(50% + var(--half-w) * ${offset})`, top: 'calc(50% - var(--half-h) * .4 - var(--obj) * .8)' }} delay={i * 0.25} talking={talking === v.id} onTap={() => setTalking(v.id)} />
          </div>
        )
      })}
    </>
  )
}

function Visitor({ v, fly, style, delay, talking, onTap }: { v: VisitorDef; fly?: boolean; style: CSSProperties; delay: number; talking: boolean; onTap: () => void }) {
  const [hop, setHop] = useState(0)
  return (
    <button
      className="visitor"
      style={{ ...style, animationDelay: `${delay}s` }}
      aria-label={v.name}
      onClick={() => {
        setHop((n) => n + 1)
        play('visitor')
        onTap()
      }}
    >
      <span className={`visitor-move${fly ? ' fly' : ''}`}>
        <span key={hop} className={`visitor-body${hop ? ' hop' : ''}`}>{v.icon}</span>
      </span>
      {talking && <span className="visitor-say pop">{v.name}：{v.line}</span>}
    </button>
  )
}
