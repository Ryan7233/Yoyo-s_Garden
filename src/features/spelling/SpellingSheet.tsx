import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import type { SubmittedResult } from '../../db/spelling'
import { speakEnglish } from '../../ui/voice'
import './spelling.css'

/**
 * YoYo Words 的手写默写页。两个应用都在 ryan7233.github.io 下，花园可以把它全屏嵌进来，
 * 用 postMessage 交词单、收结果，进度不会分成两份。开发时由 vite 代理到本地的 Words。
 */
export const WORDS_DICTATION_URL: string = import.meta.env.VITE_WORDS_DICTATION_URL ?? '/yoyo-words/dictation.html'

const MSG_READY = 'yoyo-dictation:ready'
const MSG_START = 'yoyo-dictation:start'
const MSG_RESULT = 'yoyo-dictation:result'
const MSG_CLOSE = 'yoyo-dictation:close'
/** 这么久还没打开（比如第一次用又没联网），就换成纸笔默写 */
const LOAD_TIMEOUT_MS = 10_000

/** 默写打开时，家长模式不因“2 分钟没操作”自动退出（在 iframe 里点按，外面收不到） */
export const useDictationOpen = create<boolean>(() => false)

export interface DictationItem { word: string; kind: 'new' | 'review'; zh?: string }

/** selfCheck=false：周末小听写，孩子只写不对答案，交卷后家长判 */
export function SpellingSheet({ items, finishLabel = '🌷 回花园', selfCheck = true, onResult, onClose }: {
  items: DictationItem[]
  finishLabel?: string
  selfCheck?: boolean
  onResult: (results: SubmittedResult[]) => void
  onClose: () => void
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [failed, setFailed] = useState(false)
  // 回调放进 ref：父组件重新渲染不会重新挂监听
  const handlers = useRef({ items, finishLabel, selfCheck, onResult, onClose })
  handlers.current = { items, finishLabel, selfCheck, onResult, onClose }

  useEffect(() => {
    useDictationOpen.setState(true, true)
    return () => useDictationOpen.setState(false, true)
  }, [])

  useEffect(() => {
    let ready = false
    const timer = setTimeout(() => { if (!ready) setFailed(true) }, LOAD_TIMEOUT_MS)
    const onMessage = (e: MessageEvent) => {
      // 只认同一个网站下、这个 iframe 发来的消息
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return
      const data = e.data as { type?: string; summary?: { words?: unknown[] } }
      const h = handlers.current
      if (data?.type === MSG_READY) {
        ready = true
        clearTimeout(timer)
        frame.current?.contentWindow?.postMessage({ type: MSG_START, items: h.items, finishLabel: h.finishLabel, selfCheck: h.selfCheck }, location.origin)
      } else if (data?.type === MSG_RESULT && Array.isArray(data.summary?.words)) {
        h.onResult(data.summary.words.filter(isResult).map(cleanResult))
      } else if (data?.type === MSG_CLOSE) {
        h.onClose()
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return createPortal(
    <div className="spell-sheet" role="dialog" aria-modal="true" aria-label="今日默写">
      {failed ? (
        <PaperDictation items={items} finishLabel={finishLabel} selfCheck={selfCheck} onResult={onResult} onClose={onClose} />
      ) : (
        <iframe ref={frame} className="spell-frame" src={WORDS_DICTATION_URL} title="YoYo Words 默写" />
      )}
    </div>,
    document.body,
  )
}

function isResult(r: unknown): r is SubmittedResult {
  const x = r as SubmittedResult
  return !!x && typeof x.word === 'string' && (x.kind === 'new' || x.kind === 'review')
    && typeof x.firstTry === 'boolean' && typeof x.done === 'boolean' && typeof x.attempts === 'number'
}

/** 只留认识的字段；笔迹只收图片 data URL */
function cleanResult(r: SubmittedResult): SubmittedResult {
  const out: SubmittedResult = {
    word: r.word, kind: r.kind, firstTry: r.firstTry, done: r.done, attempts: r.attempts,
    checkedBy: r.checkedBy === 'none' ? 'none' : 'self',
  }
  if (typeof r.ink === 'string' && r.ink.startsWith('data:image/') && r.ink.length < 200_000) out.ink = r.ink
  return out
}

/** 打不开 Words 时的备用：在纸上写，点喇叭听读音，翻开以后自己点对错（小听写不翻开，交给家长判） */
function PaperDictation({ items, finishLabel, selfCheck, onResult, onClose }: {
  items: DictationItem[]
  finishLabel: string
  selfCheck: boolean
  onResult: (results: SubmittedResult[]) => void
  onClose: () => void
}) {
  const [shown, setShown] = useState<Set<string>>(new Set())
  const [marks, setMarks] = useState<Record<string, boolean>>({})
  const allMarked = !selfCheck || items.every((i) => i.word in marks)
  const reveal = (w: string) => setShown(new Set(shown).add(w))

  return (
    <div className="spell-paper card">
      <header className="spell-paper-head">
        <h2 className="modal-title">✍️ 今日默写（纸笔）</h2>
        <button className="btn btn-ghost" onClick={onClose}>关闭</button>
      </header>
      <p className="modal-text">YoYo Words 暂时打不开（第一次用需要联网）。拿出本子：点 🔊 听一听，写在纸上，{selfCheck ? '再翻开对一对。' : '写完交给爸爸妈妈批改。'}</p>
      <div className="spell-paper-list">
        {items.map((i) => (
          <div key={i.word} className="spell-paper-row">
            <button className="btn btn-soft btn-small" aria-label={`听 ${i.word}`} onClick={() => speakEnglish(i.word)}>🔊</button>
            <span className="spell-paper-word">
              {selfCheck && (i.kind === 'new' || shown.has(i.word)) ? i.word : '❓❓❓'}
              {i.zh && <span className="hint"> {i.zh}</span>}
            </span>
            {!selfCheck ? null : i.kind === 'review' && !shown.has(i.word)
              ? <button className="btn btn-ghost btn-small" onClick={() => reveal(i.word)}>翻开</button>
              : (
                <span className="chips">
                  <button className={`chip${marks[i.word] === true ? ' active' : ''}`} onClick={() => setMarks({ ...marks, [i.word]: true })}>✅ 对</button>
                  <button className={`chip${marks[i.word] === false ? ' active' : ''}`} onClick={() => setMarks({ ...marks, [i.word]: false })}>🔁 再练</button>
                </span>
              )}
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary btn-big"
        disabled={!allMarked}
        onClick={() => onResult(items.map((i) => (selfCheck
          ? { word: i.word, kind: i.kind, firstTry: marks[i.word], done: marks[i.word], attempts: 1, checkedBy: 'self' as const }
          : { word: i.word, kind: i.kind, firstTry: false, done: false, attempts: 1, checkedBy: 'none' as const })))}
      >
        {finishLabel}
      </button>
    </div>
  )
}
