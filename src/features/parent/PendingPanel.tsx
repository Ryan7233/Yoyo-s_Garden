import { useEffect, useState } from 'react'
import { useStore, act } from '../../app/store'
import { confirmRecord, rejectRecord } from '../../db/actions'
import { confirmExerciseRecord, getVideo, rejectExerciseRecord } from '../../db/exercise'
import type { ExerciseRecord } from '../../data/types'
import { formatValue } from '../tasks/Exercise'
import { formatDay, isEditable } from '../../engine/taskDay'
import type { TaskRecord } from '../../data/types'
import { Modal } from '../../ui/Modal'

export function PendingPanel() {
  const { records, tasks, today, settings, exerciseRecords, exercises } = useStore()
  const [rejecting, setRejecting] = useState<TaskRecord | null>(null)
  const [rejectingEx, setRejectingEx] = useState<ExerciseRecord | null>(null)
  const videos = exerciseRecords.filter((r) => r.status === 'pending')
  const [note, setNote] = useState('')
  const backfill = settings?.backfillDays ?? 2
  const pending = records.filter((r) => r.status === 'pending')
  const byDay = new Map<string, TaskRecord[]>()
  for (const r of pending) byDay.set(r.date, [...(byDay.get(r.date) ?? []), r])
  const days = [...byDay.keys()].sort().reverse()
  const taskOf = (id: string) => tasks.find((t) => t.id === id)

  if (!pending.length && !videos.length) return <p className="empty">没有待确认的任务 🎉</p>

  const confirmAll = () =>
    act(async () => {
      for (const r of pending) if (isEditable(r.date, today, backfill)) await confirmRecord(r.id)
    })

  return (
    <div className="panel">
      {videos.length > 0 && (
        <>
          <h3 className="panel-day">📹 破纪录视频（{videos.length}）</h3>
          <p className="row-sub">日常练习奖励已经到账；确认后算作新纪录，再发 5 金币。确认或驳回后视频会删除。</p>
          {videos.map((r) => {
            const def = exercises.find((d) => d.id === r.exerciseId)
            return (
              <div key={r.id} className="card video-card">
                <div className="row-title">{def?.icon} {def?.name ?? r.exerciseId} · {def ? formatValue(def, r.value) : r.value} · {formatDay(r.date, today)}</div>
                <VideoPlayer id={r.videoBlobId} />
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => { setRejectingEx(r); setNote('') }}>驳回</button>
                  <button className="btn btn-primary" onClick={() => act(() => confirmExerciseRecord(r.id))}>✓ 确认是新纪录</button>
                </div>
              </div>
            )
          })}
        </>
      )}
      {pending.length > 0 && <button className="btn btn-primary btn-big" onClick={confirmAll}>✓ 全部确认任务（{pending.length}）</button>}
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
      {rejectingEx && (
        <Modal onClose={() => setRejectingEx(null)}>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>驳回这次纪录</h2>
          <p style={{ color: 'var(--text-soft)' }}>日常练习的奖励不扣，只是不算纪录。可以留一句话给孩子：</p>
          <input className="input" value={note} maxLength={30} placeholder="比如：脚碰到地了，下次再挑战" onChange={(e) => setNote(e.target.value)} />
          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button className="btn btn-ghost" onClick={() => setRejectingEx(null)}>取消</button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await act(() => rejectExerciseRecord(rejectingEx.id, note))
                setRejectingEx(null)
              }}
            >
              驳回
            </button>
          </div>
        </Modal>
      )}
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

/** 从本地库读出视频播放；可拖动进度条快进 */
function VideoPlayer({ id }: { id?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    if (!id) {
      setMissing(true)
      return
    }
    let u: string | null = null
    let alive = true
    getVideo(id).then((blob) => {
      if (!alive) return
      if (!blob) return setMissing(true)
      u = URL.createObjectURL(blob)
      setUrl(u)
    })
    return () => {
      alive = false
      if (u) URL.revokeObjectURL(u)
    }
  }, [id])
  if (missing) return <p className="row-sub">视频找不到了（可能是从备份恢复的数据），可以直接确认或驳回</p>
  if (!url) return <p className="row-sub">视频加载中…</p>
  return <video className="ex-video" src={url} controls playsInline preload="metadata" />
}
