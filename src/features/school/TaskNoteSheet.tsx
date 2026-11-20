import { useEffect, useState } from 'react'
import type { TaskNote } from '../../data/taskNotes'
import { Modal } from '../../ui/Modal'
import { cueEnd, cueStart, unlockAudio } from '../../ui/voice'
import './school.css'

// 计时开始的时间记在本机：关掉卡片再打开，计时接着走
const timerKey = (note: TaskNote, i: number) => `note-timer:${note.taskId}:${note.date}:${i}`
function readStart(key: string): number | null {
  try {
    const v = Number(localStorage.getItem(key))
    return v > 0 ? v : null
  } catch {
    return null
  }
}
function writeStart(key: string, at: number | null) {
  try {
    if (at) localStorage.setItem(key, String(at))
    else localStorage.removeItem(key)
  } catch {
    /* 存不了就只在这次打开里计时 */
  }
}

/** 一步里的计时器：开始后倒数，时间到响一声并替孩子打勾 */
function StepTimer({ minutes, storeKey, onDone }: { minutes: number; storeKey: string; onDone: () => void }) {
  const [startedAt, setStartedAt] = useState(() => readStart(storeKey))
  const [now, setNow] = useState(() => Date.now())
  const total = minutes * 60
  const left = startedAt ? Math.max(0, total - Math.floor((now - startedAt) / 1000)) : total
  useEffect(() => {
    if (!startedAt) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [startedAt])
  useEffect(() => {
    if (startedAt && left === 0) {
      cueEnd()
      onDone()
    }
    // 只在归零那一刻触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, left === 0])
  const mm = String(Math.floor(left / 60)).padStart(2, '0'),
    ss = String(left % 60).padStart(2, '0')
  return (
    <span className="step-timer">
      <b className="num">{mm}:{ss}</b>
      {!startedAt ? (
        <button className="btn btn-soft btn-small" onClick={() => { unlockAudio(); cueStart(); const at = Date.now(); writeStart(storeKey, at); setNow(at); setStartedAt(at) }}>⏱️ 开始计时</button>
      ) : left > 0 ? (
        <button className="btn btn-ghost btn-small" onClick={() => { writeStart(storeKey, null); setStartedAt(null) }}>重来</button>
      ) : (
        <span className="step-timer-done">时间到 🎉</span>
      )}
    </span>
  )
}

/** 任务上老师当天留的作业：老师的原话 + 几个步骤，每做完一步打个勾，全勾上再交（onFinish 为空时只是再看一遍） */
export function TaskNoteSheet({ icon, name, note, onFinish, onClose }: { icon: string; name: string; note: TaskNote; onFinish?: () => Promise<unknown>; onClose: () => void }) {
  const [done, setDone] = useState<boolean[]>(() => note.steps.map(() => false))
  const left = done.filter((d) => !d).length
  return (
    <Modal wide onClose={onClose}>
      <div className="school-hw">
        <h2 className="modal-title">{icon} {name} · {note.title}</h2>
        <p className="school-teacher">👩‍🏫 老师说：{note.teacher}</p>
        <ol className="school-items">
          {note.steps.map((it, i) => (
            <li key={it.text}>
              <button className={`card school-item${done[i] ? ' done' : ''}`} aria-pressed={done[i]} onClick={() => setDone(done.map((d, k) => (k === i ? !d : d)))}>
                <span className="school-check" aria-hidden>{done[i] ? '✓' : ''}</span>
                <span className="school-icon" aria-hidden>{it.icon}</span>
                <span className="school-text">
                  <b>{it.text}</b>
                  {it.tip && <span className="hint">{it.tip}</span>}
                </span>
              </button>
              {it.timer && <StepTimer minutes={it.timer} storeKey={timerKey(note, i)} onDone={() => setDone((d) => d.map((x, k) => (k === i ? true : x)))} />}
            </li>
          ))}
        </ol>
        <div className="modal-actions">
          {onFinish ? (
            <button className="btn btn-primary btn-big" disabled={left > 0} onClick={async () => { await onFinish(); onClose() }}>
              {left > 0 ? `还有 ${left} 步没打勾` : '✋ 都做完了，交给爸爸妈妈'}
            </button>
          ) : (
            <button className="btn btn-primary btn-big" onClick={onClose}>看完了</button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
        </div>
      </div>
    </Modal>
  )
}
