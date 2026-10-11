import type { PlantInstance, PlantSpec } from '../data/types'
import { BALANCE } from '../data/balance'
import { diffDays } from './taskDay'

/** 浇水次数 → 阶段（0 种子、1 发芽、2 长大、3 成熟），阶段间平均分配 */
export function stageFor(waterCount: number, spec: PlantSpec): 0 | 1 | 2 | 3 {
  if (waterCount >= spec.waterToMature) return 3
  const per = spec.waterToMature / 3
  return Math.min(2, Math.floor(waterCount / per)) as 0 | 1 | 2
}

/** 植物是否还需要浇水（成熟的一次性植物和纯观赏植物不需要） */
export function needsWater(p: PlantInstance, spec: PlantSpec): boolean {
  if (p.stage < 3) return true
  return spec.perennial && !!spec.regrowWater && !canHarvest(p, spec)
}

/** 每株每天最多浇 1 次 */
export function canWater(p: PlantInstance, today: string, spec: PlantSpec): boolean {
  return p.lastWateredDate !== today && needsWater(p, spec)
}

export function water(p: PlantInstance, today: string, spec: PlantSpec): PlantInstance {
  if (!canWater(p, today, spec)) return p
  const waterCount = p.waterCount + 1
  return { ...p, waterCount, lastWateredDate: today, stage: stageFor(waterCount, spec) }
}

/** 连续 N 天没浇水显示口渴、暂停生长，但不会枯死 */
export function isThirsty(p: PlantInstance, today: string, spec: PlantSpec): boolean {
  if (!needsWater(p, spec)) return false
  const since = p.lastWateredDate ?? p.plantedAt.slice(0, 10)
  return diffDays(today, since) >= BALANCE.thirstyAfterDays
}

export function canHarvest(p: PlantInstance, spec: PlantSpec): boolean {
  if (p.stage !== 3) return false
  if (!spec.perennial) return true
  if (!spec.regrowWater) return false
  // 多年生：成熟时收一次，之后每 regrowWater 次浇水再产出一次
  const extra = p.waterCount - spec.waterToMature
  return extra % spec.regrowWater === 0 && p.lastHarvestWater !== p.waterCount
}

/** 收获：一次性植物返回 null（地块变空）；多年生保留并记下收获点 */
export function harvest(p: PlantInstance, spec: PlantSpec): PlantInstance | null {
  if (!spec.perennial) return null
  return { ...p, lastHarvestWater: p.waterCount }
}
