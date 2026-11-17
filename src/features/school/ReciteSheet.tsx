import { useState } from 'react'
import type { ReciteText } from '../../data/reciteTexts'
import { Modal } from '../../ui/Modal'
import './school.css'

/**
 * 背课文：先“看着读”，再“遮住背”——每句只露出第一个字，想不起来点那句看一眼。
 * 每背完一遍点一下记一遍，背过一遍就能交给爸爸妈妈听。
 */
export function ReciteSheet({ text, today, onFinish, onClose }: { text: ReciteText; today: string; onFinish?: () => Promise<unknown>; onClose: () => void }) {
  const [hide, setHide] = useState(false)
  const [peek, setPeek] = useState<Set<string>>(new Set())
  const [times, setTimes] = useState(0)
  const days = Math.round((Date.parse(text.due) - Date.parse(today)) / 86400000)
  const when = days <= 0 ? `今天${text.dueLabel}老师查` : days === 1 ? `明天${text.dueLabel}老师查` : `${text.dueLabel}老师查，还有 ${days} 天`

  const toggle = (key: string) => {
    const next = new Set(peek)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setPeek(next)
  }

  return (
    <Modal wide onClose={onClose}>
      <div className="recite">
        <h2 className="modal-title">🎙️ 背课文《{text.title}》</h2>
        <p className="recite-due">⏰ {when}</p>

        <div className="recite-modes" role="group" aria-label="怎么背">
          <button className={`btn ${hide ? 'btn-ghost' : 'btn-primary'}`} aria-pressed={!hide} onClick={() => { setHide(false); setPeek(new Set()) }}>👀 看着读</button>
          <button className={`btn ${hide ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={hide} onClick={() => { setHide(true); setPeek(new Set()) }}>🙈 遮住背</button>
        </div>
        {hide && <p className="hint recite-hint">每句只露出第一个字，想不起来就点那一句看一眼。</p>}

        <div className="recite-text">
          {text.paragraphs.map((para, p) => (
            <p key={p} className="recite-para">
              {para.map((line, l) => {
                const key = `${p}-${l}`
                const covered = hide && !peek.has(key)
                return (
                  <button key={key} className={`recite-line${covered ? ' covered' : ''}`} disabled={!hide} onClick={() => toggle(key)}>
                    {covered ? (
                      <>
                        {line[0]}
                        <span className="recite-mask">{line.slice(1).replace(/[^，。！？、“”]/g, '〇')}</span>
                      </>
                    ) : (
                      line
                    )}
                  </button>
                )
              })}
            </p>
          ))}
        </div>

        <div className="recite-bar">
          <span>已经背了 <b className="num">{times}</b> 遍</span>
          <button className="btn btn-big btn-primary" onClick={() => setTimes(times + 1)}>我背完一遍 ＋1</button>
        </div>

        <div className="modal-actions">
          {onFinish ? (
            <button className="btn btn-primary btn-big" disabled={!times} onClick={async () => { await onFinish(); onClose() }}>
              {times ? '✋ 背给爸爸妈妈听' : '先背一遍再交'}
            </button>
          ) : (
            <button className="btn btn-primary btn-big" onClick={onClose}>背完了</button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
        </div>
      </div>
    </Modal>
  )
}
