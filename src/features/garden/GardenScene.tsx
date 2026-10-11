import { useStore } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { getCatalogItem } from '../../data/catalog'
import { Icon } from '../../ui/Icon'
import { SvgArt } from '../../ui/SvgArt'
import { Mascot } from '../../ui/Mascot'
import { House } from './House'
import { SKY, skyPhase } from './sky'
import { isThirsty } from '../../engine/growth'
import type { PlantInstance } from '../../data/types'
import './garden.css'

/** 小屋占的格子（左上角 3 × 3） */
export const HOUSE_CELLS = { x: 0, y: 0, w: 3, h: 3 }

export function GardenScene({ onEnterHouse }: { onEnterHouse: () => void }) {
  const { child, plots, plants, placed, today } = useStore()
  if (!child) return null
  const phase = skyPhase(new Date().getHours())
  const outdoorPlants = plants.filter((p) => p.scene === 'outdoor')
  const outdoorPlaced = placed.filter((p) => p.scene === 'outdoor')

  return (
    <div className="garden" style={{ background: SKY[phase] }}>
      <div className="sky">
        {phase === 'night' && <div className="stars" />}
        <div className="cloud" style={{ top: '18%', animationDuration: '90s' }} />
        <div className="cloud small" style={{ top: '40%', animationDuration: '130s', animationDelay: '-60s' }} />
      </div>
      <div
        className="ground"
        style={{ gridTemplateColumns: `repeat(${BALANCE.gridWidth}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${BALANCE.gridHeight}, minmax(0, 1fr))` }}
      >
        <button
          className="house-cell"
          style={cell(HOUSE_CELLS.x, HOUSE_CELLS.y, HOUSE_CELLS.w, HOUSE_CELLS.h)}
          onClick={onEnterHouse}
          aria-label="进入小屋"
        >
          <House roof={child.houseColor} size={150} />
        </button>

        {plots.map((p) => (
          <div key={`${p.x}-${p.y}`} className={`plot ${p.kind}`} style={cell(p.x, p.y)} />
        ))}

        {outdoorPlaced.map((p) => {
          const item = getCatalogItem(p.catalogId)
          if (!item) return null
          return (
            <div key={p.id} className="placed" style={{ ...cell(p.x, p.y, item.size[0], item.size[1]), transform: p.flipped ? 'scaleX(-1)' : undefined }}>
              <Icon icon={item.icon} size={56 * Math.max(...item.size)} />
            </div>
          )
        })}

        {outdoorPlants.map((p) => (
          <PlantView key={p.id} plant={p} today={today} />
        ))}
      </div>

      {outdoorPlants.length === 0 && (
        <div className="garden-empty">
          <Mascot size={72} bounce />
          <span className="bubble">{child.mascotName}：今天还没种花哦</span>
        </div>
      )}
    </div>
  )
}

function PlantView({ plant, today }: { plant: PlantInstance; today: string }) {
  const item = getCatalogItem(plant.catalogId)
  if (!item?.plant) return null
  const isTree = item.plant.waterToMature >= 8
  const icon =
    plant.stage === 0 ? null : plant.stage === 1 ? '🌱' : plant.stage === 2 ? (isTree ? '🌳' : '🌿') : item.icon
  const thirsty = isThirsty(plant, today, item.plant)
  return (
    <div className="plant" style={cell(plant.x, plant.y)}>
      {icon ? <Icon icon={icon} size={52} /> : <SvgArt id="mound" size={52} />}
      {thirsty && <span className="thirsty">💦</span>}
    </div>
  )
}

export function cell(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}
