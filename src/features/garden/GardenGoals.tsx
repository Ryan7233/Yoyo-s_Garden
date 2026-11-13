import { useStore } from '../../app/store'
import { VISITORS } from '../../data/visitors'
import { COMBOS } from '../../data/combos'
import { snapshotOf } from '../../engine/visitors'
import { activeCombos, thingsOf } from '../../engine/combos'
import { nextGoal } from '../../engine/goals'
import { gardenCell } from './projection'

const seenOf = (unlocks: { kind: string; refId: string }[], kind: string) => new Set(unlocks.filter((u) => u.kind === kind).map((u) => u.refId))

/** “还差一点”：离得最近的一个小目标，浮在花园上方 */
export function GoalHint() {
  const { plants, placed, ledger, unlocks } = useStore()
  const goal = nextGoal({
    visitors: VISITORS,
    combos: COMBOS,
    snapshot: snapshotOf(plants, placed, ledger),
    plants,
    things: thingsOf(plants, placed),
    metVisitors: seenOf(unlocks, 'visitor'),
    foundCombos: seenOf(unlocks, 'combo'),
  })
  if (!goal) return null
  return (
    <div className="goal-hint pop" role="status">
      <span className="goal-icon" aria-hidden>{goal.icon}</span>
      <span>{goal.text}</span>
    </div>
  )
}

/** 成立的组合：组成它的东西上一闪一闪 */
export function ComboSparkles() {
  const { plants, placed, decorating } = useStore()
  if (decorating) return null
  const things = thingsOf(plants, placed)
  const lit = new Set(activeCombos(things).flatMap((a) => a.thingIds))
  return (
    <>
      {things.filter((t) => lit.has(t.id)).map((t, i) => (
        <div key={t.id} className="combo-spark" style={gardenCell(t.x, t.y, t.w, t.h)} aria-hidden>
          <span style={{ animationDelay: `${(i % 4) * 0.4}s` }}>✨</span>
        </div>
      ))}
    </>
  )
}
