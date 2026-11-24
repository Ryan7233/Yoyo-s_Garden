import { weekdayOf } from '../engine/taskDay'
import './dayChips.css'

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export interface DayPick {
  /** 可以切换的日期，新的在前 */
  dates: string[]
  current: string
  today: string
  onPick: (date: string) => void
}

/** 课程弹窗顶上的一排日期：今天 / 11/23 周一 …，点一下看那天的内容 */
export function DayChips({ dates, current, today, onPick }: DayPick) {
  if (dates.length < 2 && current === today) return null
  return (
    <div className="day-chips" role="tablist" aria-label="看哪天的">
      {dates.map((d) => (
        <button key={d} role="tab" aria-selected={d === current} className={`day-chip${d === current ? ' on' : ''}`} onClick={() => onPick(d)}>
          {d === today ? '今天' : `${Number(d.slice(5, 7))}/${Number(d.slice(8))} ${WEEK[weekdayOf(d)]}`}
        </button>
      ))}
      {current !== today && <span className="hint day-chips-note">回看：只看看、练一练，不用再交</span>}
    </div>
  )
}
