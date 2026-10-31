import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { livePlan } from '../../engine/plans'
import { cardRecords, dayProgress } from '../../engine/rewards'
import { earnedOn } from '../../engine/ledger'
import { childReportTask } from '../../db/actions'
import { EXERCISE_TASK_ID, RAISE_HAND_TASK_ID, SPELLING_QUIZ_TASK_ID, SPELLING_TASK_ID } from '../../data/tasks'
import type { TaskDef, TaskRecord } from '../../data/types'
import { spellQueue, weekQuizWords } from '../../engine/spelling'
import { submitSpellSession, type SubmittedResult } from '../../db/spelling'
import { SpellingSheet, type DictationItem } from '../spelling/SpellingSheet'
import { RaiseHandSheet } from '../courage/RaiseHandSheet'
import { Celebrate } from '../../ui/Celebrate'
import { ExerciseSheet } from './Exercise'
import { bestTodayByExercise, exercisesForDay } from '../../engine/exercise'
import './tasks.css'
import { play } from '../../ui/sfx'
import { Reward } from '../../ui/Reward'

export function TodayTasks() {
  const { child, tasks, records, ledger, today, exercises, exerciseRecords, spellWords } = useStore()
  const [showMore, setShowMore] = useState(false)
  const [celebrate, setCelebrate] = useState(0)
  const [sportOpen, setSportOpen] = useState(false)
  const [dictation, setDictation] = useState<{ taskId: string; items: DictationItem[] } | null>(null)
  const [raising, setRaising] = useState(false)
  if (!child) return null

  // 今天始终按当前配置
  const planOf = livePlan(tasks)
  const { required, more } = planOf(today)
  const latest = cardRecords(records, tasks, today)
  const progress = dayProgress(planOf, records, today)
  const earned = earnedOn(ledger, today)
  const scheduledEx = exercisesForDay(exercises, today)
  const exBest = bestTodayByExercise(exerciseRecords, today)
  const sport = { done: scheduledEx.filter((d) => exBest.has(d.id)).length, total: scheduledEx.length }

  // 每日拼写：今天的新词 + 到期的复习词；周末小听写：本周学过的词
  const queue = spellQueue(spellWords, today)
  const spellItems: Record<string, DictationItem[]> = {
    [SPELLING_TASK_ID]: [
      ...queue.fresh.map((w) => ({ word: w.word, kind: 'new' as const, zh: w.zh })),
      ...queue.review.map((w) => ({ word: w.word, kind: 'review' as const, zh: w.zh })),
    ],
    [SPELLING_QUIZ_TASK_ID]: weekQuizWords(spellWords, today).map((w) => ({ word: w.word, kind: 'review' as const, zh: w.zh })),
  }
  const spellingOf = (task: TaskDef) => {
    const items = spellItems[task.id]
    if (!items) return undefined
    const fresh = items.filter((i) => i.kind === 'new').length
    const label = task.id === SPELLING_TASK_ID
      ? [fresh && `新词 ${fresh} 个`, items.length - fresh && `复习 ${items.length - fresh} 个`].filter(Boolean).join(' · ')
      : `本周的 ${items.length} 个词`
    return { count: items.length ? label : '今天的词还没准备好', items }
  }

  const finishDictation = async (results: SubmittedResult[]) => {
    const open = dictation
    setDictation(null)
    if (!open) return
    await act(() => submitSpellSession(child.id, open.taskId === SPELLING_TASK_ID ? 'daily' : 'quiz', results, today))
    play('done')
  }

  const report = async (task: TaskDef) => {
    if (task.id === EXERCISE_TASK_ID) {
      setSportOpen(true)
      return
    }
    if (task.id === RAISE_HAND_TASK_ID) {
      setRaising(true)
      return
    }
    const spelling = spellingOf(task)
    if (spelling) {
      if (spelling.items.length) setDictation({ taskId: task.id, items: spelling.items })
      return
    }
    const r = await act(() => childReportTask(child.id, task.id, today))
    if (r.status === 'done') {
      play('done')
      setCelebrate((n) => n + 1)
    }
  }

  const pct = progress.requiredTotal ? progress.requiredDone / progress.requiredTotal : 0

  return (
    <div className="today">
      <h2 className="sheet-title">📋 今日任务</h2>
      <div className="today-summary card">
        <div className="today-progress">
          <div className="today-progress-label">
            <span className="title">必做任务</span>
            <span className="num today-count">{progress.requiredDone} / {progress.requiredTotal}</span>
          </div>
          <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={progress.requiredTotal} aria-valuenow={progress.requiredDone}>
            <span className="meter-fill" style={{ width: `${pct * 100}%` }} />
            {Array.from({ length: progress.requiredTotal }, (_, i) => (
              <span key={i} className={`meter-star${i < progress.requiredDone ? ' on' : ''}`} style={{ left: `${((i + 1) / progress.requiredTotal) * 100}%` }}>★</span>
            ))}
          </div>
        </div>
        <div className="today-earned">
          <span className="hint">今天得到</span>
          <Reward coins={earned.coin || 0} drops={earned.drop || 0} size="l" />
          {!earned.coin && !earned.drop && <span className="num today-zero">0</span>}
        </div>
      </div>

      {progress.allDone && <div className="all-done pop">🌟 今天的必做任务全部完成啦！</div>}

      <h3 className="section-title">⭐ 今日必做</h3>
      <div className="task-grid">
        {required.map((t) => <TaskCard key={t.id} task={t} record={latest.get(t.id)} sport={sport} spelling={spellingOf(t)} onReport={() => report(t)} />)}
      </div>

      <button className="more-toggle btn btn-ghost" aria-expanded={showMore} onClick={() => setShowMore(!showMore)}>
        {showMore ? '收起更多任务 ▲' : `更多任务（${more.length}）▼`}
      </button>
      {showMore && (
        <div className="task-grid">
          {more.map((t) => <TaskCard key={t.id} task={t} record={latest.get(t.id)} sport={sport} spelling={spellingOf(t)} onReport={() => report(t)} />)}
        </div>
      )}

      {celebrate > 0 && <Celebrate key={celebrate} />}
      {sportOpen && <ExerciseSheet onClose={() => setSportOpen(false)} />}
      {raising && <RaiseHandSheet onClose={() => setRaising(false)} />}
      {dictation && (
        <SpellingSheet
          items={dictation.items}
          selfCheck={dictation.taskId === SPELLING_TASK_ID}
          finishLabel={dictation.taskId === SPELLING_TASK_ID ? '🌷 回花园' : '✋ 交给爸爸妈妈'}
          onResult={finishDictation}
          onClose={() => setDictation(null)}
        />
      )}
    </div>
  )
}

interface SportProgress { done: number; total: number }

const STATUS_TEXT = { done: '✓ 已完成', pending: '⏳ 等爸爸妈妈确认', rejected: '↺ 可以再试一次' } as const

/** 任务牌：图标、名字、奖励、状态、按钮。状态都有图标和文字，不只靠颜色 */
function TaskCard({ task, record, sport, spelling, onReport }: {
  task: TaskDef
  record?: TaskRecord
  sport: SportProgress
  spelling?: { count: string; items: DictationItem[] }
  onReport: () => void
}) {
  if (task.id === EXERCISE_TASK_ID) return <SportCard task={task} sport={sport} onOpen={onReport} />
  if (task.id === RAISE_HAND_TASK_ID) return <RaiseCard task={task} onOpen={onReport} />
  const status = record?.status === 'revoked' ? undefined : record?.status
  const weekly = task.schedule.kind === 'weekly'
  return (
    <div className={`task-card ${status ?? 'todo'}`}>
      <span className="task-icon" aria-hidden>{task.icon}</span>
      <div className="task-body">
        <div className="task-name">{task.name}</div>
        <div className="task-meta">
          <Reward coins={task.coins} drops={task.drops} size="s" />
          {status && <span className={`badge ${status}`}>{weekly && status === 'done' ? '✓ 这周完成了' : STATUS_TEXT[status]}</span>}
          {weekly && !status && <span className="hint">这周哪天做都行</span>}
        </div>
        {spelling && !status && <div className="spell-count">{spelling.count}</div>}
        {status === 'rejected' && record?.note && <div className="task-note">💬 {record.note}</div>}
      </div>
      {(!status || status === 'rejected') && (
        <button className="btn btn-primary btn-big task-btn" disabled={spelling && !spelling.items.length} onClick={onReport}>
          {spelling ? (status === 'rejected' ? '再写一次' : '去默写 ✍️') : status === 'rejected' ? '再试一次' : '我完成了'}
        </button>
      )}
    </div>
  )
}

/** 运动牌：做了几项记几项，点开进入运动打卡 */
function SportCard({ task, sport, onOpen }: { task: TaskDef; sport: SportProgress; onOpen: () => void }) {
  const all = sport.total > 0 && sport.done === sport.total
  return (
    <div className={`task-card sport ${sport.done > 0 ? 'done' : 'todo'}`}>
      <span className="task-icon" aria-hidden>{task.icon}</span>
      <div className="task-body">
        <div className="task-name">{task.name}</div>
        <div className="task-meta">
          {sport.done > 0
            ? <span className="badge done">✓ 做了 <span className="num">{sport.done} / {sport.total}</span> 项</span>
            : <span className="hint">每做一项</span>}
          {sport.done === 0 && <Reward coins={2} size="s" />}
        </div>
      </div>
      <button className={`btn btn-big task-btn ${all ? 'btn-ghost' : 'btn-primary'}`} onClick={onOpen}>
        {all ? '看看成绩' : sport.done > 0 ? '继续运动' : '去运动'}
      </button>
    </div>
  )
}

/** 举手牌：一天可以记好几次，没记的日子什么都不提示 */
function RaiseCard({ task, onOpen }: { task: TaskDef; onOpen: () => void }) {
  const { handRaises, today } = useStore()
  const times = handRaises.filter((r) => r.date === today).length
  return (
    <div className={`task-card ${times ? 'done' : 'todo'}`}>
      <span className="task-icon" aria-hidden>{task.icon}</span>
      <div className="task-body">
        <div className="task-name">{task.name}</div>
        <div className="task-meta">
          {times
            ? <span className="badge done">✓ 今天记了 <span className="num">{times}</span> 次 · 🌻 +1</span>
            : <span className="hint">举手一次，得 🌻 勇气种子</span>}
        </div>
      </div>
      <button className="btn btn-primary btn-big task-btn" onClick={onOpen}>{times ? '又举手了' : '我举手了'}</button>
    </div>
  )
}
