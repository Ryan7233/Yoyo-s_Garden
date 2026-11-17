import { useState } from 'react'
import type { TaskNote } from '../../data/taskNotes'
import { Modal } from '../../ui/Modal'
import './school.css'

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
