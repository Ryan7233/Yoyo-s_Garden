import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { parentMarkDone, revokeRecord } from '../../db/actions'
import { editableDays, formatDay } from '../../engine/taskDay'
import { tasksForDay } from '../../engine/schedule'
import { latestRecordByTask } from '../../engine/rewards'
import { EXERCISE_TASK_ID } from '../../data/tasks'
import type { ExerciseRecord, TaskRecord } from '../../data/types'
import { ConfirmDialog, Modal } from '../../ui/Modal'
import type { ExerciseConfig } from '../../db/schema'
import { logExercise, revokeExerciseRecord } from '../../db/exercise'
import { exercisesForDay, parseExerciseValue } from '../../engine/exercise'
import { UNIT_LABEL } from '../../data/exercises'
import { formatValue } from '../tasks/Exercise'

const STATUS: Record<string, string> = { pending: '⏳ 等确认', done: '✓ 已完成', rejected: '已驳回', revoked: '已撤销' }

export function RecordsPanel() {
  const { records, tasks, today, settings } = useStore()
  const days = editableDays(today, settings?.backfillDays ?? 2)
  const [day, setDay] = useState(today)
  const [revoking, setRevoking] = useState<TaskRecord | null>(null)
  const { required, more } = tasksForDay(tasks, day)
  const latest = latestRecordByTask(records, day)
  const list = [...required, ...more].filter((t) => t.id !== EXERCISE_TASK_ID)

  return (
    <div className="panel">
      <div className="chips">
        {days.map((d) => (
          <button key={d} className={`chip${d === day ? ' active' : ''}`} onClick={() => setDay(d)}>{formatDay(d, today)}</button>
        ))}
      </div>
      {list.map((t) => {
        const r = latest.get(t.id)
        return (
          <div key={t.id} className="row">
            <span className="row-icon">{t.icon}</span>
            <div className="row-main">
              <div className="row-title">{t.name}{t.required && <span className="tag">必做</span>}</div>
              <div className="row-sub">{r ? STATUS[r.status] : '未开始'}{r?.note ? ` · ${r.note}` : ''}</div>
            </div>
            {r?.status === 'done' ? (
              <button className="btn btn-ghost" onClick={() => setRevoking(r)}>撤销</button>
            ) : (
              <button className="btn btn-primary" onClick={() => act(() => parentMarkDone(t.childId, t.id, day))}>
                {r?.status === 'pending' ? '确认' : '勾选完成'}
              </button>
            )}
          </div>
        )
      })}
      <ExerciseRecords day={day} />
      {revoking && (
        <ConfirmDialog
          title="撤销这条记录？"
          message="会扣回这条记录发放的奖励（余额最低扣到 0）。只用于误操作。"
          confirmText="撤销"
          onCancel={() => setRevoking(null)}
          onConfirm={async () => {
            await act(() => revokeRecord(revoking.id))
            setRevoking(null)
          }}
        />
      )}
    </div>
  )
}

const EX_STATUS: Record<string, string> = { pending: '⏳ 视频待确认', rejected: '纪录被驳回', revoked: '已撤销' }

/** 当天的运动成绩：家长代为录入（算家长见证），撤销误录 */
function ExerciseRecords({ day }: { day: string }) {
  const { child, exercises, exerciseRecords } = useStore()
  const [entering, setEntering] = useState<ExerciseConfig | null>(null)
  const [revoking, setRevoking] = useState<ExerciseRecord | null>(null)
  const [text, setText] = useState('')
  if (!child) return null
  const scheduled = exercisesForDay(exercises, day)
  if (!scheduled.length) return null
  const parsed = entering ? parseExerciseValue(text, entering.unit) : null

  return (
    <>
      <h3 className="panel-day">🏃 运动</h3>
      {scheduled.map((d) => {
        const list = exerciseRecords.filter((r) => r.date === day && r.exerciseId === d.id)
        return (
          <div key={d.id} className="row">
            <span className="row-icon">{d.icon}</span>
            <div className="row-main">
              <div className="row-title">{d.name}</div>
              {list.length === 0 && <div className="row-sub">未开始</div>}
              {list.map((r) => (
                <div key={r.id} className="row-sub ex-rec">
                  <span>
                    {formatValue(d, r.value)}{r.isPersonalBest ? ' 🏆' : ''}{EX_STATUS[r.status] ? ` · ${EX_STATUS[r.status]}` : ''}
                  </span>
                  {r.status !== 'revoked' && <button className="mini" style={{ width: 'auto', padding: '0 10px' }} onClick={() => setRevoking(r)}>撤销</button>}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => { setEntering(d); setText('') }}>录入</button>
          </div>
        )
      })}
      {entering && (
        <Modal onClose={() => setEntering(null)}>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>{entering.icon} {entering.name}</h2>
          <p style={{ color: 'var(--text-soft)' }}>家长录入的成绩算作家长见证，超过个人最好就记为新纪录。</p>
          <div className="ex-input" style={{ justifyContent: 'center', margin: '12px 0 20px' }}>
            <input className="input" style={{ width: 160, textAlign: 'center' }} autoFocus inputMode={entering.unit === 'cm' ? 'decimal' : 'numeric'} value={text} maxLength={5} onChange={(e) => setText(e.target.value)} />
            <span className="title">{UNIT_LABEL[entering.unit]}</span>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setEntering(null)}>取消</button>
            <button
              className="btn btn-primary"
              disabled={parsed === null}
              onClick={async () => {
                if (parsed === null) return
                await act(() => logExercise(child.id, entering.id, day, parsed, 'parent'))
                setEntering(null)
              }}
            >
              保存
            </button>
          </div>
        </Modal>
      )}
      {revoking && (
        <ConfirmDialog
          title="撤销这条运动成绩？"
          message="会扣回这条成绩发放的奖励（余额最低扣到 0），视频也会删除。只用于误操作。"
          confirmText="撤销"
          onCancel={() => setRevoking(null)}
          onConfirm={async () => {
            await act(() => revokeExerciseRecord(revoking.id))
            setRevoking(null)
          }}
        />
      )}
    </>
  )
}
