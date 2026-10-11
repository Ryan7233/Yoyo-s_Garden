import { useEffect, useState } from 'react'
import { useStore } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { STYLE_CSS } from '../../data/indoor'
import { harvestInfo } from '../../data/plants'
import { Icon } from '../../ui/Icon'
import { SKY, skyPhase } from '../garden/sky'
import { PlantArt } from '../garden/PlantArt'
import { PlantSheet } from '../garden/PlantSheet'
import { PlacedView, placedProps } from '../decorate/PlacedView'
import { PlacementLayer } from '../decorate/PlacementLayer'
import { ItemMenu } from '../decorate/ItemMenu'
import { VasePicker } from './VasePicker'
import { Visitors } from '../garden/Visitors'
import './house.css'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(t)
  }, [])
  return now
}

export function HouseScene() {
  const { child, placed, plants, today, decorating } = useStore()
  const [plantId, setPlantId] = useState<string | null>(null)
  const [vaseId, setVaseId] = useState<string | null>(null)
  const now = useClock()
  if (!child) return null

  const indoor = placed.filter((p) => p.scene === 'indoor')
  const wall = indoor.filter((p) => p.layer === 'wall')
  const floor = indoor.filter((p) => p.layer === 'ground')
  const pots = plants.filter((p) => p.scene === 'indoor')
  const sky = SKY[skyPhase(now.getHours())]
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

  const grid = (cols: number, rows: number) => ({
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
  })

  return (
    <div className="house">
      <div className="wall" style={{ ...grid(BALANCE.wallSlots, 1), background: STYLE_CSS[child.wallStyle ?? 'wall-default'] }}>
        {wall.map((p) => (
          <PlacedView key={p.id} {...placedProps(p)} size={52} className="wall-item">
            {p.catalogId === 'in-window' ? (
              <div className="window" style={{ background: sky }} />
            ) : p.catalogId === 'in-clock' ? (
              <span className="clock">
                <Icon icon="🕰️" size={48} />
                <span className="clock-time">{time}</span>
              </span>
            ) : undefined}
          </PlacedView>
        ))}
        {decorating && <PlacementLayer scene="indoor" layer="wall" cols={BALANCE.wallSlots} rows={1} />}
      </div>
      <div className="floor" style={{ ...grid(BALANCE.indoorWidth, BALANCE.indoorHeight), background: STYLE_CSS[child.floorStyle ?? 'floor-wood'] }}>
        {floor.map((p) => {
          const flower = p.content ? harvestInfo(p.content) : undefined
          return (
            <PlacedView
              key={p.id}
              {...placedProps(p)}
              size={60}
              className="floor-item"
              onTap={p.catalogId === 'in-vase' ? () => setVaseId(p.id) : undefined}
            >
              {p.catalogId === 'in-vase' ? (
                <span className="vase">
                  {flower && <span className="vase-flower"><Icon icon={flower.icon} size={40} /></span>}
                  <Icon icon="🏺" size={56} />
                </span>
              ) : undefined}
            </PlacedView>
          )
        })}
        {pots.map((p) => (
          <PlacedView key={p.id} id={p.id} catalogId={p.catalogId} x={p.x} y={p.y} size={56} className="floor-item" onTap={() => setPlantId(p.id)}>
            <PlantArt plant={p} today={today} size={56} />
          </PlacedView>
        ))}
        {decorating && <PlacementLayer scene="indoor" layer="ground" cols={BALANCE.indoorWidth} rows={BALANCE.indoorHeight} />}
      </div>
      <Visitors scene="indoor" />
      {decorating && <ItemMenu />}
      {plantId && <PlantSheet plantId={plantId} onClose={() => setPlantId(null)} onWatered={() => {}} />}
      {vaseId && <VasePicker vaseId={vaseId} onClose={() => setVaseId(null)} />}
    </div>
  )
}
