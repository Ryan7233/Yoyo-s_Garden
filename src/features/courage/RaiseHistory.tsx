import { useStore } from '../../app/store'
import type { RaiseResult } from '../../data/types'
import { RAISE_GOAL_DEFAULT, courageSeeds, raiseDaysInWeek, sunflowerLevel } from '../../engine/courage'
import { formatDay } from '../../engine/taskDay'

const LABEL: Record<RaiseResult, string> = { right: '✅ 答对了', wrong: '🤔 答错了', notCalled: '🙋 没叫到' }

/** 家长统计：每次举手的日期和结果（最近 30 天） */
export function RaiseHistory() {
  const { handRaises, settings, today } = useStore()
  if (!handRaises.length) return null
  const byDay = new Map<string, RaiseResult[]>()
  for (const r of [...handRaises].reverse()) byDay.set(r.date, [...(byDay.get(r.date) ?? []), r.result])
  const days = [...byDay.keys()].sort().reverse().slice(0, 30)
  const count = (k: RaiseResult) => handRaises.filter((r) => r.result === k).length
  const weeks = settings?.courageWeeks?.length ?? 0
  return (
    <section className="stats-card">
      <h3 className="panel-day">🙋 向日葵举手</h3>
      <p className="row-sub">
        一共举手 {handRaises.length} 次（答对 {count('right')}、答错 {count('wrong')}、没叫到 {count('notCalled')}），
        勇气种子 {courageSeeds(handRaises)} 颗；这周 {raiseDaysInWeek(handRaises, today)} / {settings?.raiseGoal ?? RAISE_GOAL_DEFAULT} 天，
        做到的周 {weeks} 周，向日葵 {sunflowerLevel(weeks)} 级。
      </p>
      {days.map((d) => (
        <div key={d} className="flow-row">
          <span>{formatDay(d, today)}</span>
          <span>{byDay.get(d)!.map((r) => LABEL[r]).join('　')}</span>
        </div>
      ))}
    </section>
  )
}
