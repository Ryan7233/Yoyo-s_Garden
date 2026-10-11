import { useStore } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { getCatalogItem } from '../../data/catalog'
import { Icon } from '../../ui/Icon'
import { cell } from '../garden/GardenScene'
import { SKY, skyPhase } from '../garden/sky'
import './house.css'

export function HouseScene() {
  const placed = useStore((s) => s.placed).filter((p) => p.scene === 'indoor')
  const wall = placed.filter((p) => p.layer === 'wall')
  const floor = placed.filter((p) => p.layer === 'ground')
  const sky = SKY[skyPhase(new Date().getHours())]

  return (
    <div className="house">
      <div className="wall" style={{ gridTemplateColumns: `repeat(${BALANCE.wallSlots}, 1fr)` }}>
        {wall.map((p) => {
          const item = getCatalogItem(p.catalogId)
          if (!item) return null
          return (
            <div key={p.id} className="wall-item" style={{ gridColumn: p.x + 1 }}>
              {item.id === 'in-window' ? <div className="window" style={{ background: sky }} /> : <Icon icon={item.icon} size={56} />}
            </div>
          )
        })}
      </div>
      <div
        className="floor"
        style={{ gridTemplateColumns: `repeat(${BALANCE.indoorWidth}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${BALANCE.indoorHeight}, minmax(0, 1fr))` }}
      >
        {floor.map((p) => {
          const item = getCatalogItem(p.catalogId)
          if (!item) return null
          return (
            <div key={p.id} className="floor-item" style={{ ...cell(p.x, p.y, item.size[0], item.size[1]), transform: p.flipped ? 'scaleX(-1)' : undefined }}>
              <Icon icon={item.icon} size={64 * Math.max(...item.size)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
