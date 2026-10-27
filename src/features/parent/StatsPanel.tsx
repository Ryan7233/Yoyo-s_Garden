// 家长统计（8.2，P1）：近 7 / 30 天完成率热力图、各任务完成率、运动折线、金币收支
import { useState } from 'react'
import { useStore } from '../../app/store'
import type { ExerciseConfig } from '../../db/schema'
import type { LedgerReason } from '../../data/types'
import { firstDataDay, planResolver } from '../../engine/plans'
import { coinSummary, dayCompletion, exerciseSeries, lastNDays, taskRates, type DayCompletion } from '../../engine/stats'
import { formatDay } from '../../engine/taskDay'
import { formatValue } from '../tasks/Exercise'
import { RaiseHistory } from '../courage/RaiseHistory'

// 完成率用一种绿色由浅到深（顺序色阶），没有安排任务的日子用灰色
const HEAT = ['#eef8f3', '#c4ead8', '#8fd5b6', '#52b98f', '#2a8a65']
const NO_DATA = '#f1eef2'
const heatStep = (rate: number) => Math.min(HEAT.length - 1, Math.floor(rate * HEAT.length))
function heatColor(rate: number | null): string {
  return rate === null ? NO_DATA : HEAT[heatStep(rate)]
}
const pct = (r: number | null) => (r === null ? '—' : `${Math.round(r * 100)}%`)

const REASON_LABEL: Partial<Record<LedgerReason, string>> = {
  task: '任务', exercise: '运动', personalBest: '运动纪录', bonus: '加分', allDone: '全勤', streak: '连续全勤',
  harvest: '收获', sell: '卖果实', visitor: '访客', purchase: '购买', expand: '扩建地块', revoke: '撤销扣回', gift: '礼物',
}

export function StatsPanel() {
  const { child, tasks, dayPlans, records, exercises, exerciseRecords, ledger, today } = useStore()
  const [range, setRange] = useState<7 | 30>(7)
  const [picked, setPicked] = useState<DayCompletion | null>(null)
  const days = lastNDays(today, range)
  // 建园之前的日子是“无数据”，不计入完成率
  const planOf = planResolver(tasks, dayPlans, child ? firstDataDay(child, records) : undefined)
  const completion = days.map((d) => dayCompletion(planOf, records, d))
  const rates = taskRates(planOf, records, days)
  const coins = coinSummary(ledger, days)
  const avg = (() => {
    const list = completion.filter((c) => c.total > 0)
    const done = list.reduce((s, c) => s + c.done, 0)
    const total = list.reduce((s, c) => s + c.total, 0)
    return total ? done / total : null
  })()
  const stars = completion.filter((c) => c.allDone).length

  return (
    <div className="panel stats">
      <div className="chips">
        {([7, 30] as const).map((n) => (
          <button key={n} className={`chip${range === n ? ' active' : ''}`} onClick={() => { setRange(n); setPicked(null) }}>近 {n} 天</button>
        ))}
      </div>

      <div className="stat-tiles">
        <Tile label="任务完成率" value={pct(avg)} />
        <Tile label="全勤天数" value={`${stars} 天`} />
        <Tile label="金币收入" value={`+${coins.income}`} />
        <Tile label="金币支出" value={`−${coins.expense}`} />
      </div>

      <section className="stats-card">
        <h3 className="panel-day">每天完成率</h3>
        <div className="heat" style={{ gridTemplateColumns: `repeat(${range === 7 ? 7 : 10}, minmax(0, 1fr))` }}>
          {completion.map((c) => (
            <button
              key={c.day}
              className={`heat-cell${c.noData ? ' no-data' : ''}${picked?.day === c.day ? ' picked' : ''}`}
              style={{ background: heatColor(c.rate), color: c.rate !== null && heatStep(c.rate) === HEAT.length - 1 ? '#fff' : undefined }}
              onClick={() => setPicked(picked?.day === c.day ? null : c)}
              aria-label={c.noData ? `${formatDay(c.day, today)} 无数据` : `${formatDay(c.day, today)} 完成 ${c.done}/${c.total}`}
            >
              <span className="heat-day">{Number(c.day.slice(8))}</span>
              {c.noData && range === 7 && <span className="heat-nodata">无数据</span>}
              {c.allDone && <span className="heat-star">⭐</span>}
            </button>
          ))}
        </div>
        <div className="heat-foot">
          <span className="row-sub">
            {picked?.noData ? `${formatDay(picked.day, today)}：无数据（那天还没有花园）` : picked ? `${formatDay(picked.day, today)}：完成 ${picked.done} / ${picked.total} 项（${pct(picked.rate)}）${picked.allDone ? '，全勤 ⭐' : ''}` : '点一个格子看当天详情'}
          </span>
          <span className="heat-legend" aria-hidden>
            0%{HEAT.map((h) => <i key={h} style={{ background: h }} />)}100%
          </span>
        </div>
      </section>

      <section className="stats-card">
        <h3 className="panel-day">各任务完成率</h3>
        {rates.map((r) => (
          <div key={r.task.id} className="bar-row">
            <span className="bar-label">{r.task.icon} {r.task.name}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${(r.rate ?? 0) * 100}%` }} /></span>
            <span className="bar-value">{r.done}/{r.scheduled}</span>
          </div>
        ))}
        {rates.length === 0 && <p className="empty">这段时间没有安排任务</p>}
      </section>

      <section className="stats-card">
        <h3 className="panel-day">运动（每天最好成绩）</h3>
        <div className="ex-charts">
          {exercises.map((d) => <ExerciseChart key={d.id} def={d} days={days} values={exerciseSeries(exerciseRecords, d.id, days)} />)}
        </div>
      </section>

      <RaiseHistory />

      <section className="stats-card">
        <h3 className="panel-day">金币流水</h3>
        <div className="chips">
          {Object.entries(coins.byReason).sort((a, b) => b[1]! - a[1]!).map(([k, v]) => (
            <span key={k} className="tag reason-tag">{REASON_LABEL[k as LedgerReason] ?? k} {v! > 0 ? `+${v}` : v}</span>
          ))}
        </div>
        {coins.entries.slice(0, 50).map((e) => (
          <div key={e.id} className="flow-row">
            <span className="row-sub">{formatDay(e.date ?? e.at.slice(0, 10), today)}</span>
            <span className="flow-what">{REASON_LABEL[e.reason] ?? e.reason}{e.note ? ` · ${e.note}` : ''}</span>
            <span className="flow-amount">{e.amount > 0 ? `+${e.amount}` : e.amount}</span>
          </div>
        ))}
        {coins.entries.length === 0 && <p className="empty">这段时间没有金币变动</p>}
      </section>
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span className="row-sub">{label}</span>
      <span className="title stat-value">{value}</span>
    </div>
  )
}

const W = 300
const H = 120
const PAD = { l: 34, r: 12, t: 12, b: 22 }

/** 单个子项的折线：一条线，没做的日子断开；点一下看那天的成绩 */
function ExerciseChart({ def, days, values }: { def: ExerciseConfig; days: string[]; values: (number | null)[] }) {
  const today = useStore((s) => s.today)
  const [pick, setPick] = useState<number | null>(null)
  const nums = values.filter((v): v is number => v !== null)
  const header = (
    <div className="ex-chart-head">
      <span className="row-title">{def.icon} {def.name}</span>
      <span className="row-sub">{def.target === null ? '未定目标' : `目标 ${formatValue(def, def.target)}`}</span>
    </div>
  )
  if (!nums.length) return <div className="ex-chart">{header}<p className="row-sub chart-empty">这段时间没做</p></div>

  const lo = Math.min(0, ...nums, def.target ?? Infinity)
  const hi = Math.max(...nums, def.target ?? -Infinity, lo + 1)
  const x = (i: number) => PAD.l + (days.length === 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (days.length - 1))
  const y = (v: number) => PAD.t + ((hi - v) * (H - PAD.t - PAD.b)) / (hi - lo)
  // 连续有值的点连成一段
  const segs: string[] = []
  let cur = ''
  values.forEach((v, i) => {
    if (v === null) {
      if (cur) segs.push(cur)
      cur = ''
    } else cur += `${cur ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`
  })
  if (cur) segs.push(cur)
  const lastIdx = values.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0).pop()!
  const shown = pick ?? lastIdx

  return (
    <div className="ex-chart">
      {header}
      <svg viewBox={`0 0 ${W} ${H}`} className="ex-svg" role="img" aria-label={`${def.name}折线图`}>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(lo)} y2={y(lo)} className="axis" />
        <text x={PAD.l - 6} y={y(hi) + 4} className="tick" textAnchor="end">{hi}</text>
        <text x={PAD.l - 6} y={y(lo) + 4} className="tick" textAnchor="end">{lo}</text>
        {def.target !== null && (
          <>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(def.target)} y2={y(def.target)} className="target" />
            <text x={W - PAD.r} y={y(def.target) - 4} className="tick" textAnchor="end">目标</text>
          </>
        )}
        <text x={PAD.l} y={H - 4} className="tick">{Number(days[0].slice(8))}日</text>
        <text x={W - PAD.r} y={H - 4} className="tick" textAnchor="end">{Number(days[days.length - 1].slice(8))}日</text>
        {pick !== null && <line x1={x(pick)} x2={x(pick)} y1={PAD.t} y2={H - PAD.b} className="cross" />}
        {segs.map((d, i) => <path key={i} d={d} className="series" />)}
        {values.map((v, i) => v !== null && (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === shown ? 5 : 4} className="dot" />
        ))}
        {/* 点按热区：每天一条竖带，比点本身大 */}
        {values.map((v, i) => (
          <rect
            key={`h${i}`}
            x={x(i) - (W - PAD.l - PAD.r) / Math.max(1, days.length - 1) / 2}
            y={0}
            width={(W - PAD.l - PAD.r) / Math.max(1, days.length - 1)}
            height={H}
            fill="transparent"
            onClick={() => setPick(v === null ? null : i)}
          />
        ))}
      </svg>
      <div className="row-sub ex-readout">
        {formatDay(days[shown], today)}：{values[shown] === null ? '没做' : formatValue(def, values[shown]!)}
      </div>
    </div>
  )
}
