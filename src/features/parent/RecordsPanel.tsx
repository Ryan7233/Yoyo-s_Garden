import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { parentMarkDone, revokeRecord } from '../../db/actions'
import { editableDays, formatDay } from '../../engine/taskDay'
import { tasksForDay } from '../../engine/schedule'
import { latestRecordByTask } from '../../engine/rewards'
import { EXERCISE_TASK_ID } from '../../data/tasks'
import type { TaskRecord } from '../../data/types'
import { ConfirmDialog } from '../../ui/Modal'

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
