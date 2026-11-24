import { useState } from 'react'
import type { ReciteText } from '../../data/reciteTexts'
import { Modal } from '../../ui/Modal'
import './school.css'

/**
 * 背课文：先“看着读”，再“遮住背”——每句只露出第一个字，想不起来点那句看一眼。
 * 每背完一遍点一下记一遍，背过一遍就能交给爸爸妈妈听。
 */
export function ReciteSheet({ texts, today, onFinish, onClose }: { texts: ReciteText[]; today: string; onFinish?: () => Promise<unknown>; onClose: () => void }) {
  const [at, setAt] = useState(0)
  const [counts, setCounts] = useState<number[]>(() => texts.map(() => 0))
  const goalOf = (t: ReciteText) => t.goal ?? 1
  const left = texts.filter((t, i) => counts[i] < goalOf(t))
  const text = texts[at]
  return (
    <Modal wide onClose={onClose}>
      <div className="recite">
        {texts.length > 1 && (
          <div className="recite-tabs" role="tablist">
            {texts.map((t, i) => (
              <button key={t.title} role="tab" aria-selected={i === at} className={`btn ${i === at ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setAt(i)}>
                {counts[i] >= goalOf(t) ? '✓ ' : ''}{t.kind === 'read' ? '读' : '背'}《{t.title}》
              </button>
            ))}
          </div>
        )}
        <ReciteBody key={text.title} text={text} today={today} times={counts[at]} onTimes={(n) => setCounts(counts.map((c, i) => (i === at ? n : c)))} />
        <div className="modal-actions">
          {onFinish ? (
            <button className="btn btn-primary btn-big" disabled={left.length > 0} onClick={async () => { await onFinish(); onClose() }}>
              {left.length === 0
                ? '✋ 读 / 背给爸爸妈妈听'
                : left.length === 1 && left[0] === text
                  ? goalOf(text) > 1 ? `再${text.kind === 'read' ? '读' : '背'} ${goalOf(text) - counts[at]} 遍就能交` : `先${text.kind === 'read' ? '读' : '背'}一遍再交`
                  : `还有《${left.map((t) => t.title).join('》《')}》`}
            </button>
          ) : (
            <button className="btn btn-primary btn-big" onClick={onClose}>好了</button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
        </div>
      </div>
    </Modal>
  )
}

/** 一篇课文：读熟的只看着读；要背的还能“遮住背”。每读/背完一遍点一下记一遍 */
function ReciteBody({ text, today, times, onTimes }: { text: ReciteText; today: string; times: number; onTimes: (n: number) => void }) {
  const [hide, setHide] = useState(false)
  const [peek, setPeek] = useState<Set<string>>(new Set())
  const setTimes = onTimes
  const read = text.kind === 'read'
  const goal = text.goal ?? 1
  const verb = read ? '读' : '背'
  const days = Math.round((Date.parse(text.due) - Date.parse(today)) / 86400000)
  const when = !text.dueLabel
    ? read ? '读熟它' : '这几天把它背熟'
    : read
    ? days <= 0 ? `今天有${text.dueLabel}` : days === 1 ? `明天有${text.dueLabel}，今天读熟它` : `${text.dueLabel}还有 ${days} 天`
    : days <= 0 ? `今天${text.dueLabel}老师查` : days === 1 ? `明天${text.dueLabel}老师查` : `${text.dueLabel}老师查，还有 ${days} 天`

  const toggle = (key: string) => {
    const next = new Set(peek)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setPeek(next)
  }

  return (
    <>
        <h2 className="modal-title">{read ? `📖 读熟《${text.title}》` : `🎙️ 背课文《${text.title}》`}</h2>
        <p className="recite-due">⏰ {when}</p>

        {read && <p className="hint recite-hint">大声读，读得慢一点、清楚一点，至少读 {goal} 遍。</p>}
        {!read && <div className="recite-modes" role="group" aria-label="怎么背">
          <button className={`btn ${hide ? 'btn-ghost' : 'btn-primary'}`} aria-pressed={!hide} onClick={() => { setHide(false); setPeek(new Set()) }}>👀 看着读</button>
          <button className={`btn ${hide ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={hide} onClick={() => { setHide(true); setPeek(new Set()) }}>🙈 遮住背</button>
        </div>}
        {hide && <p className="hint recite-hint">每句只露出第一个字，想不起来就点那一句看一眼。</p>}

        <div className={`recite-text${read ? " read" : ""}`}>
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
                        <span className="recite-mask">{line.slice(1).replace(/[^，。！？、“”／]/g, '〇')}</span>
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
          <span>
            已经{verb}了 <b className="num">{times}</b> 遍
            {goal > 1 && <span className="recite-stars" aria-hidden> {Array.from({ length: goal }, (_, i) => (i < times ? '⭐' : '☆')).join('')}</span>}
          </span>
          <button className="btn btn-big btn-primary" onClick={() => setTimes(times + 1)}>我{verb}完一遍 ＋1</button>
        </div>

    </>
  )
}
