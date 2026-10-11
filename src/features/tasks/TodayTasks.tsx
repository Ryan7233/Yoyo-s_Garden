import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { tasksForDay } from '../../engine/schedule'
import { dayProgress, latestRecordByTask } from '../../engine/rewards'
import { earnedOn } from '../../engine/ledger'
import { childReportTask } from '../../db/actions'
import { EXERCISE_TASK_ID } from '../../data/tasks'
import type { TaskDef, TaskRecord } from '../../data/types'
import { Celebrate } from '../../ui/Celebrate'
import { ExerciseSheet } from './Exercise'
import { bestTodayByExercise, exercisesForDay } from '../../engine/exercise'
import './tasks.css'

export function TodayTasks() {
  const { child, tasks, records, ledger, today, exercises, exerciseRecords } = useStore()
  const [showMore, setShowMore] = useState(false)
  const [celebrate, setCelebrate] = useState(0)
  const [sportOpen, setSportOpen] = useState(false)
  if (!child) return null

  const { required, more } = tasksForDay(tasks, today)
  const latest = latestRecordByTask(records, today)
  const progress = dayProgress(tasks, records, today)
  const earned = earnedOn(ledger, today)
  const scheduledEx = exercisesForDay(exercises, today)
  const exBest = bestTodayByExercise(exerciseRecords, today)
  const sport = { done: scheduledEx.filter((d) => exBest.has(d.id)).length, total: scheduledEx.length }

  const report = async (task: TaskDef) => {
    if (task.id === EXERCISE_TASK_ID) {
      setSportOpen(true)
      return
    }
    const r = await act(() => childReportTask(child.id, task.id, today))
    if (r.status === 'done') setCelebrate((n) => n + 1)
  }

  return (
    <div className="today">
      <header className="today-head">
        <h2 className="today-title">📋 今日任务</h2>
        <div className="today-stats">
          <span className="stat-pill">⭐ 必做 {progress.requiredDone} / {progress.requiredTotal}</span>
          <span className="stat-pill">今天得到 🪙 {earned.coin} 💧 {earned.drop}</span>
        </div>
      </header>

      {progress.allDone && <div className="all-done pop">🌟 今天的必做任务全部完成啦！</div>}

      <div className="task-grid">
        {required.map((t) => <TaskCard key={t.id} task={t} record={latest.get(t.id)} sport={sport} onReport={() => report(t)} />)}
      </div>

      <button className="more-toggle btn btn-ghost" onClick={() => setShowMore(!showMore)}>
        {showMore ? '收起更多任务 ▲' : `更多任务（${more.length}）▼`}
      </button>
      {showMore && (
        <div className="task-grid">
          {more.map((t) => <TaskCard key={t.id} task={t} record={latest.get(t.id)} sport={sport} onReport={() => report(t)} />)}
        </div>
      )}

      {celebrate > 0 && <Celebrate key={celebrate} />}
      {sportOpen && <ExerciseSheet onClose={() => setSportOpen(false)} />}
    </div>
  )
}

interface SportProgress { done: number; total: number }

function TaskCard({ task, record, sport, onReport }: { task: TaskDef; record?: TaskRecord; sport: SportProgress; onReport: () => void }) {
  if (task.id === EXERCISE_TASK_ID) return <SportCard task={task} sport={sport} onOpen={onReport} />
  const status = record?.status === 'revoked' ? undefined : record?.status
  const reward = [task.coins ? `${task.coins} 金币` : '', task.drops ? `${task.drops} 水滴` : ''].filter(Boolean).join(' ')
  return (
    <div className={`task-card ${status ?? 'todo'}`}>
      <span className="task-icon">{task.icon}</span>
      <div className="task-body">
        <div className="task-name">{task.name}</div>
        <div className="task-reward">{reward}</div>
        {status === 'rejected' && record?.note && <div className="task-note">💬 {record.note}</div>}
      </div>
      <div className="task-action">
        {status === 'done' && <span className="badge done">✓ 已完成</span>}
        {status === 'pending' && <span className="badge pending">⏳ 等爸爸妈妈确认</span>}
        {(!status || status === 'rejected') && (
          <button className="btn btn-primary" onClick={onReport}>
            {status === 'rejected' ? '再试一次' : '我完成了'}
          </button>
        )}
      </div>
    </div>
  )
}

/** 运动卡片：做了几项记几项，点开进入运动打卡 */
function SportCard({ task, sport, onOpen }: { task: TaskDef; sport: SportProgress; onOpen: () => void }) {
  const all = sport.total > 0 && sport.done === sport.total
  return (
    <div className={`task-card ${sport.done > 0 ? 'done' : 'todo'}`}>
      <span className="task-icon">{task.icon}</span>
      <div className="task-body">
        <div className="task-name">{task.name}</div>
        <div className="task-reward">{sport.done > 0 ? `今天做了 ${sport.done} / ${sport.total} 项` : '每做一项 2 金币'}</div>
      </div>
      <div className="task-action">
        {all ? (
          <button className="btn btn-ghost" onClick={onOpen}>✓ 全做完啦</button>
        ) : (
          <button className="btn btn-primary" onClick={onOpen}>{sport.done > 0 ? '继续运动' : '去运动'}</button>
        )}
      </div>
    </div>
  )
}
