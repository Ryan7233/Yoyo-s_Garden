import type { PlantInstance } from '../../data/types'
import { getCatalogItem } from '../../data/catalog'
import { canHarvest, isThirsty } from '../../engine/growth'
import { Icon } from '../../ui/Icon'
import { SvgArt } from '../../ui/SvgArt'

/** 生长阶段图标：种子是小土堆，发芽 🌱，长大 🌿（树 🌳），成熟显示植物自己的图标 */
export function stageIcon(catalogId: string, stage: number): string {
  const item = getCatalogItem(catalogId)
  if (!item?.plant) return '🌱'
  if (stage === 0) return 'svg:mound'
  if (stage === 1) return '🌱'
  if (stage === 2) return item.plant.waterToMature >= 8 ? '🌳' : '🌿'
  return item.icon
}

export function PlantArt({ plant, today, size = 48, hop }: { plant: PlantInstance; today: string; size?: number; hop?: boolean }) {
  const item = getCatalogItem(plant.catalogId)
  if (!item?.plant) return null
  const icon = stageIcon(plant.catalogId, plant.stage)
  const thirsty = isThirsty(plant, today, item.plant)
  const ready = canHarvest(plant, item.plant)
  return (
    <span className={`plant-art${hop ? ' hop' : ''}${ready ? ' ready' : ''}`}>
      {icon.startsWith('svg:') ? <SvgArt id={icon.slice(4)} size={size} /> : <Icon icon={icon} size={size} />}
      {thirsty && <span className="thirsty" aria-label="口渴了">💦</span>}
      {ready && <span className="ready-badge" aria-label="可以收获">✨</span>}
    </span>
  )
}
