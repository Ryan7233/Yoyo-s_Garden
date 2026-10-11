import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { confirmRecord, rejectRecord } from '../../db/actions'
import { formatDay, isEditable } from '../../engine/taskDay'
import type { TaskRecord } from '../../data/types'
import { Modal } from '../../ui/Modal'

export function PendingPanel() {
  const { records, tasks, today, settings } = useStore()
  const [rejecting, setRejecting] = useState<TaskRecord | null>(null)
  const [note, setNote] = useState('')
  const backfill = settings?.backfillDays ?? 2
  const pending = records.filter((r) => r.status === 'pending')
  const byDay = new Map<string, TaskRecord[]>()
  for (const r of pending) byDay.set(r.date, [...(byDay.get(r.date) ?? []), r])
  const days = [...byDay.keys()].sort().reverse()
  const taskOf = (id: string) => tasks.find((t) => t.id === id)

  if (!pending.length) return <p className="empty">没有待确认的任务 🎉</p>

  const confirmAll = () =>
    act(async () => {
      for (const r of pending) if (isEditable(r.date, today, backfill)) await confirmRecord(r.id)
    })

  return (
    <div className="panel">
      <button className="btn btn-primary btn-big" onClick={confirmAll}>✓ 全部确认（{pending.length}）</button>
      {days.map((d) => {
        const editable = isEditable(d, today, backfill)
        return (
          <div key={d}>
            <h3 className="panel-day">{formatDay(d, today)}{!editable && '（已过补录期，只读）'}</h3>
            {byDay.get(d)!.map((r) => {
              const t = taskOf(r.taskId)
              return (
                <div key={r.id} className="row">
                  <span className="row-icon">{t?.icon}</span>
                  <div className="row-main">
                    <div className="row-title">{t?.name ?? r.taskId}</div>
                    {t?.hint && <div className="row-sub">达标：{t.hint}</div>}
                  </div>
                  {editable && (
                    <>
                      <button className="btn btn-ghost" onClick={() => { setRejecting(r); setNote('') }}>驳回</button>
                      <button className="btn btn-primary" onClick={() => act(() => confirmRecord(r.id))}>确认</button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
      {rejecting && (
        <Modal onClose={() => setRejecting(null)}>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>驳回：{taskOf(rejecting.taskId)?.name}</h2>
          <p style={{ color: 'var(--text-soft)' }}>不扣分，只是这次不发奖励。可以留一句话给孩子：</p>
          <input className="input" value={note} maxLength={30} placeholder="比如：明天再试试" onChange={(e) => setNote(e.target.value)} />
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setRejecting(null)}>取消</button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await act(() => rejectRecord(rejecting.id, note))
                setRejecting(null)
              }}
            >
              驳回
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
