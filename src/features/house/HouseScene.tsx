import { useEffect, useState, type CSSProperties } from 'react'
import { useStore } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { STYLE_CSS } from '../../data/indoor'
import { harvestInfo } from '../../data/plants'
import { Icon } from '../../ui/Icon'
import { ScrollHints } from '../../ui/ScrollHints'
import { SKY, skyPhase } from '../garden/sky'
import { PlantArt } from '../garden/PlantArt'
import { PlantSheet } from '../garden/PlantSheet'
import { PlacedView, placedProps } from '../decorate/PlacedView'
import { PlacementLayer } from '../decorate/PlacementLayer'
import { VasePicker } from './VasePicker'
import { Visitors } from '../garden/Visitors'
import { play } from '../../ui/sfx'
import './house.css'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(t)
  }, [])
  return now
}

/** 挂钟：真实时间，指针 + 数字 */
function WallClock({ now }: { now: Date }) {
  const h = now.getHours()
  const m = now.getMinutes()
  const ha = ((h % 12) + m / 60) * 30
  const ma = m * 6
  return (
    <span className="clock">
      <svg viewBox="0 0 64 64" aria-hidden>
        <circle cx={32} cy={33} r={27} fill="#B4824F" stroke="#5B4366" strokeWidth={2.5} />
        <circle cx={32} cy={31} r={23} fill="#FFFAF0" stroke="#5B4366" strokeWidth={2} />
        {[0, 90, 180, 270].map((a) => (
          <rect key={a} x={31} y={10} width={2} height={5} rx={1} fill="#5B4366" transform={`rotate(${a} 32 31)`} />
        ))}
        <line x1={32} y1={31} x2={32} y2={19} stroke="#5B4366" strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${ha} 32 31)`} />
        <line x1={32} y1={31} x2={32} y2={13} stroke="#E85A8F" strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${ma} 32 31)`} />
        <circle cx={32} cy={31} r={2.5} fill="#5B4366" />
        <path d="M16 22 Q20 14 28 12" fill="none" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
      </svg>
      <span className="clock-time num">{h}:{String(m).padStart(2, '0')}</span>
    </span>
  )
}

/**
 * 室内小屋：上面是墙（挂件一排），下面是有透视感的地板（8 × 5）。
 * 地板每一行从里到外略微变高，格子仍是 DOM 网格，点击和摆放位置与看到的一致。
 */
export function HouseScene() {
  const { child, placed, plants, today, decorating } = useStore()
  const [plantId, setPlantId] = useState<string | null>(null)
  const [vaseId, setVaseId] = useState<string | null>(null)
  const [singing, setSinging] = useState<string | null>(null)
  const now = useClock()
  if (!child) return null

  const sing = (id: string) => {
    play('song')
    setSinging(id)
    setTimeout(() => setSinging((cur) => (cur === id ? null : cur)), 3200)
  }

  const indoor = placed.filter((p) => p.scene === 'indoor')
  const wall = indoor.filter((p) => p.layer === 'wall')
  const floor = indoor.filter((p) => p.layer === 'ground')
  const pots = plants.filter((p) => p.scene === 'indoor')
  const sky = SKY[skyPhase(now.getHours())]
  const vars = { '--cols': BALANCE.indoorWidth, '--rows': BALANCE.indoorHeight, '--slots': BALANCE.wallSlots } as CSSProperties

  return (
    <>
      <ScrollHints />
      <div className="scene-scroll">
        <div className="room" style={vars}>
          <div className="wall" style={{ background: STYLE_CSS[child.wallStyle ?? 'wall-default'] }}>
            <div className="wall-light" aria-hidden />
            <div className="bunting" aria-hidden>
              <svg viewBox="0 0 400 46" preserveAspectRatio="none">
                <path d="M0 6 Q200 30 400 6" fill="none" stroke="#B4824F" strokeWidth={2} />
                {Array.from({ length: 11 }, (_, i) => {
                  const x = 18 + i * 36
                  const y = 6 + 24 * (1 - ((x - 200) / 200) ** 2)
                  const c = ['var(--primary)', '#FFD66B', '#7ED7B5', '#B79CED'][i % 4]
                  return <path key={i} d={`M${x - 11} ${y} L${x + 11} ${y} L${x} ${y + 18} Z`} fill={c} stroke="#5B4366" strokeWidth={1.5} strokeLinejoin="round" />
                })}
              </svg>
            </div>
            <div className="wall-grid">
              {wall.map((p) => (
                <PlacedView key={p.id} {...placedProps(p)} className="wall-item" wall>
                  {p.catalogId === 'in-window' ? (
                    <span className="window" style={{ '--window-sky': sky } as CSSProperties}>
                      <span className="window-glass" />
                      <span className="window-sill" />
                    </span>
                  ) : p.catalogId === 'in-clock' ? (
                    <WallClock now={now} />
                  ) : undefined}
                </PlacedView>
              ))}
              {decorating && <PlacementLayer scene="indoor" layer="wall" cols={BALANCE.wallSlots} rows={1} />}
            </div>
            <div className="baseboard" aria-hidden />
          </div>
          <div className="floor" style={{ background: STYLE_CSS[child.floorStyle ?? 'floor-wood'] }}>
            <div className="floor-shade" aria-hidden />
            <div className="floor-sides" aria-hidden />
            <div className="floor-grid">
              {floor.map((p) => {
                const flower = p.content ? harvestInfo(p.content) : undefined
                return (
                  <PlacedView
                    key={p.id}
                    {...placedProps(p)}
                    className="floor-item"
                    onTap={p.catalogId === 'in-vase' ? () => setVaseId(p.id) : p.catalogId === 'in-sing-corner' ? () => sing(p.id) : undefined}
                  >
                    {p.catalogId === 'in-vase' ? (
                      <span className="vase">
                        {flower && <span className="vase-flower"><Icon icon={flower.icon} fluid /></span>}
                        <Icon icon="svg:vase" fluid />
                      </span>
                    ) : p.catalogId === 'in-sing-corner' ? (
                      <span className="sing">
                        <Icon icon="🎤" fluid />
                        {singing === p.id && ['🎵', '🎶', '🎵'].map((n, i) => (
                          <span key={i} className="sing-note" style={{ left: `${10 + i * 28}%`, animationDelay: `${i * 0.3}s` }}>{n}</span>
                        ))}
                      </span>
                    ) : p.catalogId === 'in-fish-tank' ? (
                      <span className="tank">
                        <span className="tank-water">
                          <span className="tank-fish">🐠</span>
                          <span className="tank-bubble" />
                        </span>
                        <span className="tank-base" />
                      </span>
                    ) : undefined}
                  </PlacedView>
                )
              })}
              {pots.map((p) => (
                <PlacedView key={p.id} id={p.id} catalogId={p.catalogId} x={p.x} y={p.y} className="floor-item" onTap={() => setPlantId(p.id)}>
                  <PlantArt plant={p} today={today} fluid />
                </PlacedView>
              ))}
              {decorating && <PlacementLayer scene="indoor" layer="ground" cols={BALANCE.indoorWidth} rows={BALANCE.indoorHeight} />}
            </div>
          </div>
          <Visitors scene="indoor" />
        </div>
      </div>
      {plantId && <PlantSheet plantId={plantId} onClose={() => setPlantId(null)} onWatered={() => {}} />}
      {vaseId && <VasePicker vaseId={vaseId} onClose={() => setVaseId(null)} />}
    </>
  )
}
