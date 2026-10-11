import { useState } from 'react'
import { useStore } from '../../app/store'
import { SEEDS, SPECIAL_SEEDS } from '../../data/plants'
import { VISITORS } from '../../data/visitors'
import { BADGES } from '../../data/badges'
import { Icon } from '../../ui/Icon'
import { allDoneDays, monthGrid, shiftMonth } from '../../engine/stats'
import { formatDay, toTaskDay } from '../../engine/taskDay'
import '../shop/shop.css'
import './codex.css'

type Tab = 'plants' | 'visitors' | 'badges' | 'calendar'
const TABS: { id: Tab; label: string }[] = [
  { id: 'plants', label: '🌷 植物' },
  { id: 'visitors', label: '🐾 访客' },
  { id: 'badges', label: '🏅 徽章' },
  { id: 'calendar', label: '⭐ 全勤日历' },
]

/** 图鉴三页（植物、访客、徽章）和全勤日历 */
export function Codex() {
  const [tab, setTab] = useState<Tab>('plants')
  return (
    <div>
      <h2 className="sheet-title">📖 图鉴</h2>
      <nav className="shop-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`shop-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
      {tab === 'plants' && <PlantsPage />}
      {tab === 'visitors' && <VisitorsPage />}
      {tab === 'badges' && <BadgesPage />}
      {tab === 'calendar' && <CalendarPage />}
    </div>
  )
}

function useSeen(kind: 'codex' | 'visitor' | 'badge') {
  const unlocks = useStore((s) => s.unlocks)
  return new Map(unlocks.filter((u) => u.kind === kind).map((u) => [u.refId, u.at]))
}

function PlantsPage() {
  const seen = useSeen('codex')
  const all = [...SEEDS, ...SPECIAL_SEEDS]
  return (
    <>
      <p className="codex-count title">种出过的植物 {all.filter((p) => seen.has(p.id)).length} / {all.length}</p>
      <div className="codex-grid">
        {all.map((p) => {
          const on = seen.has(p.id)
          return (
            <div key={p.id} className={`codex-card${on ? '' : ' unknown'}`}>
              <Icon icon={p.icon} size={56} />
              <span className="title">{on ? p.name : '？？？'}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

function VisitorsPage() {
  const seen = useSeen('visitor')
  const today = useStore((s) => s.today)
  return (
    <>
      <p className="codex-count title">来过的小客人 {VISITORS.filter((v) => seen.has(v.id)).length} / {VISITORS.length}</p>
      <div className="codex-grid wide">
        {VISITORS.map((v) => {
          const at = seen.get(v.id)
          return (
            <div key={v.id} className={`codex-card${at ? '' : ' unknown'}`}>
              <span style={{ fontSize: 52 }}>{v.icon}</span>
              <span className="title">{at ? v.name : '？？？'}</span>
              <span className="codex-sub">{at ? `第一次来：${formatDay(toTaskDay(new Date(at)), today)}` : `怎样才会来：${v.hint}`}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

function BadgesPage() {
  const seen = useSeen('badge')
  return (
    <>
      <p className="codex-count title">获得的徽章 {BADGES.filter((b) => seen.has(b.id)).length} / {BADGES.length}</p>
      <div className="codex-grid wide">
        {BADGES.map((b) => {
          const on = seen.has(b.id)
          return (
            <div key={b.id} className={`codex-card badge-card${on ? ' got' : ' unknown'}`}>
              <span className="badge-medal">{b.icon}</span>
              <span className="title">{b.name}</span>
              <span className="codex-sub">{b.desc}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

function CalendarPage() {
  const { tasks, records, today } = useStore()
  const [month, setMonth] = useState(today.slice(0, 7))
  const stars = allDoneDays(tasks, records)
  const weeks = monthGrid(month)
  const [y, m] = month.split('-').map(Number)
  const count = weeks.flat().filter((d) => d && stars.has(d)).length
  return (
    <div className="cal">
      <div className="cal-head">
        <button className="btn btn-ghost" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="上个月">‹</button>
        <span className="title cal-title">{y} 年 {m} 月 · 全勤 {count} 天</span>
        <button className="btn btn-ghost" disabled={month >= today.slice(0, 7)} onClick={() => setMonth(shiftMonth(month, 1))} aria-label="下个月">›</button>
      </div>
      <div className="cal-grid">
        {WEEK.map((w) => <span key={w} className="cal-week">{w}</span>)}
        {weeks.flat().map((d, i) => (
          <span key={i} className={`cal-day${d && stars.has(d) ? ' star' : ''}${d === today ? ' today' : ''}`}>
            {d && (
              <>
                <span className="cal-num">{Number(d.slice(8))}</span>
                {stars.has(d) && <span className="cal-star">⭐</span>}
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
