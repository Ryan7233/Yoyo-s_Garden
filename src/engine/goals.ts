// “还差一点”：在花园上方提示离得最近的一个小目标——还没来过的小客人，或还没发现的组合。
// 只挑一条，按“还差几步”从少到多；要花钱买东西的排在能马上做到的后面。
import type { PlantInstance } from '../data/types'
import type { VisitorCondition, VisitorDef } from '../data/visitors'
import type { ComboDef } from '../data/combos'
import { getCatalogItem } from '../data/catalog'
import { meets, type GardenSnapshot } from './visitors'
import { activeCombos, hasThing, type Thing } from './combos'

export interface Goal {
  icon: string
  text: string
  /** 还差几步，越小越靠前 */
  steps: number
}

/** 要买东西才能做到的，排在后面 */
const BUY = 10

interface Need { text: string; steps: number }

const nameOf = (id: string) => getCatalogItem(id)?.name ?? ''

/** 一个条件还差什么；已经满足返回 null */
function need(c: VisitorCondition, g: GardenSnapshot, plants: PlantInstance[]): Need | null {
  if (meets(c, g)) return null
  switch (c.kind) {
    case 'bloomingFlowers': {
      const n = c.count - g.bloomingFlowers
      return { text: `再开 ${n} 朵花`, steps: n }
    }
    case 'veggieHarvests': {
      const n = c.count - g.veggieHarvests
      return { text: `再收获 ${n} 次蔬果`, steps: n }
    }
    case 'outdoorDecorCount': {
      const n = c.count - g.outdoorDecorCount
      return { text: `再摆 ${n} 件装饰`, steps: n }
    }
    case 'hasItem':
      return { text: `摆一个${nameOf(c.itemIds[0])}`, steps: BUY }
    case 'maturePlant': {
      // 已经种下的：差几次浇水；没种的：先去种
      let best: Need | null = null
      for (const p of plants) {
        if (p.scene !== 'outdoor' || !c.plantIds.includes(p.catalogId)) continue
        const spec = getCatalogItem(p.catalogId)?.plant
        if (!spec) continue
        const n = Math.max(1, spec.waterToMature - p.waterCount)
        if (!best || n < best.steps) best = { text: `${nameOf(p.catalogId)}再浇 ${n} 次水`, steps: n }
      }
      return best ?? { text: `种一棵${nameOf(c.plantIds[0])}`, steps: BUY }
    }
    case 'any': {
      const all = c.conditions.map((x) => need(x, g, plants)).filter((x): x is Need => !!x)
      return all.sort((a, b) => a.steps - b.steps)[0] ?? null
    }
    case 'all': {
      const all = c.conditions.map((x) => need(x, g, plants)).filter((x): x is Need => !!x)
      if (!all.length) return null
      return { text: all.map((x) => x.text).join('，'), steps: all.reduce((s, x) => s + x.steps, 0) }
    }
  }
}

export interface GoalInput {
  visitors: VisitorDef[]
  combos: ComboDef[]
  snapshot: GardenSnapshot
  plants: PlantInstance[]
  things: Thing[]
  /** 来过的访客、发现过的组合 */
  metVisitors: Set<string>
  foundCombos: Set<string>
}

export function nextGoal(i: GoalInput): Goal | null {
  const goals: Goal[] = []
  for (const v of i.visitors) {
    if (v.scene !== 'outdoor' || i.metVisitors.has(v.id)) continue
    const n = need(v.condition, i.snapshot, i.plants)
    if (n) goals.push({ icon: v.icon, text: `${n.text}，${v.name}就会来`, steps: n.steps })
  }
  // 组合：已经有其中一样，提示把另一样放到它旁边
  const active = new Set(activeCombos(i.things, i.combos).map((a) => a.combo.id))
  for (const c of i.combos) {
    if (i.foundCombos.has(c.id) || active.has(c.id)) continue
    const hasA = hasThing(i.things, c.a)
    const hasB = hasThing(i.things, c.b)
    if (hasA && hasB) goals.push({ icon: c.icon, text: `把${c.a.label}挪到${c.b.label}旁边，试试会发生什么`, steps: 1 })
    else if (hasA) goals.push({ icon: c.icon, text: `在${c.a.label}旁边放${c.b.label}，试试会发生什么`, steps: BUY })
  }
  goals.sort((a, b) => a.steps - b.steps)
  return goals[0] ?? null
}
