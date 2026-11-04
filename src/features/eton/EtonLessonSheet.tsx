import { useEffect, useRef, useState } from 'react'
import type { BookCard, EtonLesson, LessonCard, TopicCard, VerbsCard, WordCard } from '../../data/etonLessons'
import { Modal } from '../../ui/Modal'
import { speakEnglish } from '../../ui/voice'

/** 伊顿课本是美式英语（fall、color），用美式发音 */
const speakEn = (text: string) => speakEnglish(text, 'en-US')
import './eton.css'

/**
 * 伊顿英语课：一张一张翻看当天的单词卡和课本要点，点单词或句子能听发音。
 * onFinish：这周作业还没打卡时，看完最后一张点“学完了”就交作业（等家长确认）
 */
export function EtonLessonSheet({ lesson, onFinish, onClose }: { lesson: EtonLesson; onFinish?: () => Promise<unknown>; onClose: () => void }) {
  const [at, setAt] = useState(0)
  const top = useRef<HTMLDivElement>(null)
  // 翻到下一张时回到最上面
  useEffect(() => {
    top.current?.closest('.modal')?.scrollTo({ top: 0 })
  }, [at])
  const card = lesson.cards[at]
  const last = at === lesson.cards.length - 1

  return (
    <Modal wide onClose={onClose}>
      <div className="eton" ref={top}>
        <div className="eton-head">
          <h2 className="modal-title">📒 伊顿英语 · {lesson.title}</h2>
          <span className="eton-page num" aria-live="polite">{at + 1} / {lesson.cards.length}</span>
        </div>

        <CardView card={card} />

        <p className="eton-hint hint">点一下单词或句子，可以听发音 🔊</p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-big" disabled={at === 0} onClick={() => setAt(at - 1)}>← 上一张</button>
          {last
            ? <button className="btn btn-primary btn-big" onClick={async () => { await onFinish?.(); onClose() }}>{onFinish ? '学完了，交作业 ✓' : '看完啦'}</button>
            : <button className="btn btn-primary btn-big" onClick={() => setAt(at + 1)}>下一张 →</button>}
        </div>
      </div>
    </Modal>
  )
}

function CardView({ card }: { card: LessonCard }) {
  switch (card.kind) {
    case 'word': return <WordView card={card} />
    case 'topic': return <TopicView card={card} />
    case 'verbs': return <VerbsView card={card} />
    case 'book': return <BookView card={card} />
  }
}

function Remember({ say, not }: { say: string; not: string }) {
  return (
    <div className="eton-remember">
      <span>✓ <b>{say}</b></span>
      <span className="eton-not">✗ <s>{not}</s></span>
    </div>
  )
}

function Say({ text, className = '' }: { text: string; className?: string }) {
  return (
    <button className={`eton-say ${className}`} onClick={() => speakEn(text)} aria-label={`听：${text}`}>
      <span>{text}</span>
      <span className="eton-speaker" aria-hidden>🔊</span>
    </button>
  )
}

function WordView({ card }: { card: WordCard }) {
  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <div className="eton-hero">
        <button className="eton-word" onClick={() => speakEn(card.word)} aria-label={`听：${card.word}`}>{card.word}</button>
        <span className="eton-meaning">{card.meaning}</span>
      </div>

      <section className="eton-block">
        <h3 className="eton-sub">Spell it</h3>
        <div className="eton-tiles">
          {card.spell.map((l, i) => <span key={i} className={`eton-tile t${i % 2}`}>{l}</span>)}
        </div>
        <p className="eton-tip">{card.tip}</p>
      </section>

      {card.family && (
        <section className="eton-block">
          <h3 className="eton-sub">Word family</h3>
          <div className="eton-grid four">
            {card.family.map((f) => (
              <button key={f.head} className="eton-chip" onClick={() => speakEn(f.head + f.tail)}>
                {f.head}<b>{f.tail}</b>
              </button>
            ))}
          </div>
        </section>
      )}

      {card.places && (
        <section className="eton-block">
          <h3 className="eton-sub">Where?</h3>
          <div className="eton-grid three">
            {card.places.map((p) => <button key={p} className="eton-chip" onClick={() => speakEn(p)}>{p}</button>)}
          </div>
        </section>
      )}

      <section className="eton-block">
        <h3 className="eton-sub">Say it</h3>
        <div className="eton-lines">
          {card.sentences.map((s) => <Say key={s} text={s} />)}
        </div>
      </section>

      {card.remember && <Remember {...card.remember} />}
    </div>
  )
}

function TopicView({ card }: { card: TopicCard }) {
  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <h3 className="eton-topic">{card.title}</h3>

      <section className="eton-block">
        <h3 className="eton-sub">What's the weather like?</h3>
        <div className="eton-grid two">
          {card.weather.map((w) => (
            <button key={w.word} className="eton-weather" onClick={() => speakEn(`${w.word}. ${w.sentence}`)}>
              <span className="eton-wicon" aria-hidden>{w.icon}</span>
              <span className="eton-wtext"><b>{w.word}</b><span>{w.sentence}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="eton-block">
        <h3 className="eton-sub">Four seasons, again and again</h3>
        <div className="eton-seasons">
          {card.seasons.map((s, i) => (
            <button key={s.word} className={`eton-season s${i}`} onClick={() => speakEn(`${s.word}. ${s.sentence}`)}>
              <b>{s.word}</b>
              <span>{s.sentence}</span>
            </button>
          ))}
        </div>
        <p className="eton-tip">Then spring comes again! Fall and autumn mean the same season.</p>
      </section>

      <section className="eton-block">
        <h3 className="eton-sub">Talk time</h3>
        <div className="eton-lines">
          {card.talk.map((t) => (
            <div key={t.q} className="eton-qa">
              <Say text={t.q} className="q" />
              <Say text={t.a} className="a" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/** 动作词：点一下听词和整句，再问“在哪个季节” */
function VerbsView({ card }: { card: VerbsCard }) {
  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <h3 className="eton-topic">{card.title}</h3>

      <section className="eton-block">
        <h3 className="eton-sub">Act it out!</h3>
        <div className="eton-grid two">
          {card.verbs.map((v) => (
            <button key={v.word} className="eton-weather" onClick={() => speakEn(`${v.word}. ${v.sentence}`)}>
              <span className="eton-wicon" aria-hidden>{v.icon}</span>
              <span className="eton-wtext"><b>{v.word} <small className="eton-zh">{v.meaning}</small></b><span>{v.sentence}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="eton-block">
        <h3 className="eton-sub">Which season?</h3>
        <div className="eton-lines">
          {card.talk.map((t) => (
            <div key={t.q} className="eton-qa">
              <Say text={t.q} className="q" />
              <Say text={t.a} className="a" />
            </div>
          ))}
        </div>
      </section>

      {card.remember && <Remember {...card.remember} />}
    </div>
  )
}

/** 小书跟读：每两页一句、一问一答 */
function BookView({ card }: { card: BookCard }) {
  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <h3 className="eton-topic">📗 {card.title}</h3>

      <section className="eton-block">
        <h3 className="eton-sub">Read along</h3>
        <div className="eton-lines">
          {card.pages.map((p) => (
            <div key={p.pages} className="eton-page-pair">
              {/* 图标不放进朗读的句子里，免得把表情也念出来 */}
              <span className="eton-pages hint">p. {p.pages} <span aria-hidden>{p.icon}</span></span>
              <Say text={p.lead} />
              <div className="eton-qa">
                <Say text={p.q} className="q" />
                <Say text={p.a} className="a" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="eton-block">
        <h3 className="eton-sub">Words to know</h3>
        <div className="eton-grid three">
          {card.words.map((w) => <button key={w} className="eton-chip" onClick={() => speakEn(w)}>{w}</button>)}
        </div>
      </section>
    </div>
  )
}
