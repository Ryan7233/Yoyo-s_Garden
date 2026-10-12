import type { PlantInstance } from '../../data/types'
import { getCatalogItem } from '../../data/catalog'
import { canHarvest, isThirsty } from '../../engine/growth'
import { Icon } from '../../ui/Icon'

/** 生长阶段图标：种子是小土堆，发芽、长大（树是小树苗）用自绘图，成熟显示植物自己的图标 */
export function stageIcon(catalogId: string, stage: number): string {
  const item = getCatalogItem(catalogId)
  if (!item?.plant) return 'svg:sprout'
  if (stage === 0) return 'svg:mound'
  if (stage === 1) return 'svg:sprout'
  if (stage === 2) return item.plant.waterToMature >= 8 ? 'svg:young-tree' : 'svg:sapling'
  return item.icon
}

/**
 * 一株植物：口渴和可收获用小牌子标出来（图标 + 形状，不只靠颜色）。
 * fluid：在场景格子里按格子大小缩放。
 */
export function PlantArt({ plant, today, size = 48, hop, fluid }: { plant: PlantInstance; today: string; size?: number; hop?: boolean; fluid?: boolean }) {
  const item = getCatalogItem(plant.catalogId)
  if (!item?.plant) return null
  const icon = stageIcon(plant.catalogId, plant.stage)
  const thirsty = isThirsty(plant, today, item.plant)
  const ready = canHarvest(plant, item.plant)
  return (
    <span className={`plant-art${hop ? ' hop' : ''}${ready ? ' ready' : ''}${fluid ? ' fluid' : ''}`}>
      <Icon icon={icon} size={size} fluid={fluid} />
      {thirsty && <span className="plant-flag thirsty" aria-label="口渴了">💧</span>}
      {ready && <span className="plant-flag ready-flag" aria-label="可以收获">✨</span>}
    </span>
  )
}
