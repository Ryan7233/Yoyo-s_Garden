// 解锁、访客首次来访、成就徽章、图鉴点亮：比较“现在满足的”和“已经记录的”，算出这次要新发的（5.6、5.7）
import type { CatalogItem, PlantInstance, Unlock } from '../data/types'
import type { VisitorDef } from '../data/visitors'
import type { BadgeDef, BadgeRule } from '../data/badges'
import { isUnlocked, type ProgressStats } from './unlocks'
import { presentVisitors, type GardenSnapshot } from './visitors'

export interface BadgeStats extends ProgressStats {
  /** 现在种着的室外植物株数 */
  plantedNow: number
  /** 图鉴里点亮的植物种数 */
  codexPlants: number
  /** 来访过的访客种数 */
  visitorsMet: number
  /** 室内摆放的家具件数（地板和墙面） */
  indoorPlaced: number
}

export function badgeProgress(rule: BadgeRule, s: BadgeStats): number {
  return s[rule.kind]
}

export function hasBadge(b: BadgeDef, s: BadgeStats): boolean {
  return badgeProgress(b.rule, s) >= b.rule.count
}

export interface GrantInput {
  catalog: CatalogItem[]
  visitors: VisitorDef[]
  badges: BadgeDef[]
  stats: Omit<BadgeStats, 'codexPlants' | 'visitorsMet'>
  snapshot: GardenSnapshot
  plants: PlantInstance[]
  unlocks: Unlock[]
}

export interface Grants {
  /** 刚解锁的特殊物品 id */
  items: string[]
  /** 第一次来访的访客 id */
  visitors: string[]
  /** 新点亮图鉴的植物（种子 id） */
  codex: string[]
  /** 新获得的徽章 id */
  badges: string[]
}

function idsOf(unlocks: Unlock[], kind: Unlock['kind']): Set<string> {
  return new Set(unlocks.filter((u) => u.kind === kind).map((u) => u.refId))
}

/** 幂等：已经记录过的不会再发 */
export function computeGrants(i: GrantInput): Grants {
  const hadItems = idsOf(i.unlocks, 'item')
  const hadVisitors = idsOf(i.unlocks, 'visitor')
  const hadCodex = idsOf(i.unlocks, 'codex')
  const hadBadges = idsOf(i.unlocks, 'badge')

  const items = i.catalog.filter((c) => c.unlock && !hadItems.has(c.id) && isUnlocked(c.unlock, i.stats)).map((c) => c.id)
  const visitors = presentVisitors(i.visitors, i.snapshot).map((v) => v.id).filter((id) => !hadVisitors.has(id))
  // 种到成熟就算“种出过”（观赏植物和室内盆栽没有收获，也要能点亮）
  const codex = [...new Set(i.plants.filter((p) => p.stage === 3).map((p) => p.catalogId))].filter((id) => !hadCodex.has(id))

  const full: BadgeStats = {
    ...i.stats,
    codexPlants: hadCodex.size + codex.length,
    visitorsMet: hadVisitors.size + visitors.length,
  }
  const badges = i.badges.filter((b) => !hadBadges.has(b.id) && hasBadge(b, full)).map((b) => b.id)
  return { items, visitors, codex, badges }
}

/** 物品是否已解锁：曾经解锁过（有记录）或现在满足条件 */
export function itemUnlocked(item: CatalogItem, stats: ProgressStats | null, unlocks: Unlock[]): boolean {
  if (!item.unlock) return true
  if (unlocks.some((u) => u.kind === 'item' && u.refId === item.id)) return true
  return !!stats && isUnlocked(item.unlock, stats)
}
