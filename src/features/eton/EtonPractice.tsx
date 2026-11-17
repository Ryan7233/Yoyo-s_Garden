// 周五自己做的两个自查小游戏：看视频后的勾选题、Land / Water 拖拽分类。
// 每次打开课都是新的，做错了可以马上再来，不影响交作业。
import { useRef, useState, type PointerEvent } from 'react'
import type { LandWord, MatchCard, PickCard, SortCard } from '../../data/etonLessons'
import { play } from '../../ui/sfx'
import { speakEn } from './Say'

/** 勾选题：可以多选，点“对答案”后每个选项标出对错 */
export function PickView({ card }: { card: PickCard }) {
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)
  const right = checked && card.answers.every((a) => chosen.has(a)) && [...chosen].every((c) => card.answers.includes(c))

  const toggle = (word: string) => {
    speakEn(word)
    if (checked) return
    const next = new Set(chosen)
    if (next.has(word)) next.delete(word)
    else next.add(word)
    setChosen(next)
  }
  const check = () => {
    setChecked(true)
    const ok = card.answers.every((a) => chosen.has(a)) && [...chosen].every((c) => card.answers.includes(c))
    if (ok) play('fanfare')
  }

  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <h3 className="eton-topic">🧹 {card.title}</h3>
      {card.tip && <p className="eton-tip">{card.tip}</p>}
      <section className="eton-block">
        <h3 className="eton-sub">{card.question}</h3>
        <div className="eton-picks">
          {card.options.map((o) => {
            const on = chosen.has(o.word)
            const answer = card.answers.includes(o.word)
            // 对完答案：选对 ✓、选错 ✗、漏选的也标出来
            const mark = !checked ? (on ? '☑' : '☐') : on ? (answer ? '✓' : '✗') : answer ? '!' : ''
            const state = !checked ? (on ? 'on' : '') : on ? (answer ? 'right' : 'wrong') : answer ? 'missed' : ''
            return (
              <button key={o.word} className={`eton-pick ${state}`} aria-pressed={on} onClick={() => toggle(o.word)}>
                <span className="eton-pick-icon" aria-hidden>{o.icon}</span>
                <b>{o.word}</b>
                <span className="eton-pick-mark" aria-hidden>{mark}</span>
              </button>
            )
          })}
        </div>
      </section>
      {!checked && (
        <button className="btn btn-primary btn-big" disabled={!chosen.size} onClick={check}>对答案 ✓</button>
      )}
      {checked && (
        <div className={`eton-result ${right ? 'ok' : 'retry'}`} role="status">
          <span>
            {right
              ? `🎉 全对！${card.answers.join(', ')}`
              : '再想想：✓ 选对了，✗ 选错了，! 是漏掉的。'}
          </span>
          <button className="btn btn-ghost" onClick={() => { setChosen(new Set()); setChecked(false) }}>↺ 再做一次</button>
        </div>
      )}
    </div>
  )
}

/** 打乱顺序：卡片按“陆地在前、水在后”排着，就等于把答案告诉她了 */
function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface Drag { word: string; x0: number; y0: number; dx: number; dy: number }

/**
 * 拖拽分类：把卡片拖到 Land 或 Water 框里。放对了留在框里、有音效；放错了弹回、晃一下。
 * 拖不动时也可以先点卡片、再点框。
 */
export function SortView({ card }: { card: SortCard }) {
  const [order, setOrder] = useState(() => shuffled(card.words))
  const [placed, setPlaced] = useState<Record<string, LandWord['group']>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [wrong, setWrong] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const boxes = useRef<Partial<Record<LandWord['group'], HTMLDivElement | null>>>({})

  const left = order.filter((w) => !placed[w.word])
  const done = left.length === 0

  const drop = (w: LandWord, group: LandWord['group']) => {
    setPicked(null)
    if (w.group !== group) {
      setWrong(w.word)
      window.setTimeout(() => setWrong((x) => (x === w.word ? null : x)), 600)
      return
    }
    const next = { ...placed, [w.word]: group }
    setPlaced(next)
    if (Object.keys(next).length === card.words.length) play('fanfare')
    else play('coin')
  }

  const boxAt = (x: number, y: number): LandWord['group'] | null => {
    for (const g of ['land', 'water'] as const) {
      const r = boxes.current[g]?.getBoundingClientRect()
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return g
    }
    return null
  }

  const down = (e: PointerEvent<HTMLButtonElement>, w: LandWord) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ word: w.word, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 })
  }
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    setDrag({ ...drag, dx: e.clientX - drag.x0, dy: e.clientY - drag.y0 })
  }
  const up = (e: PointerEvent<HTMLButtonElement>, w: LandWord) => {
    const d = drag
    setDrag(null)
    if (!d) return
    // 几乎没动：当成点一下——听词、选中，再点框
    if (Math.hypot(d.dx, d.dy) < 12) {
      speakEn(`${w.word}. ${w.sentence}`)
      setPicked(picked === w.word ? null : w.word)
      return
    }
    const g = boxAt(e.clientX, e.clientY)
    if (g) drop(w, g)
  }

  const tapBox = (g: LandWord['group']) => {
    const w = card.words.find((x) => x.word === picked)
    if (w) drop(w, g)
  }

  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <h3 className="eton-topic">{card.title}</h3>
      <p className="eton-tip">Drag each card into Land or Water. 拖不动就先点卡片，再点框。</p>

      <div className="eton-sort-left" aria-label="还没分的卡片">
        {left.map((w) => {
          const d = drag?.word === w.word ? drag : null
          return (
            <button
              key={w.word}
              className={`eton-sort-card${picked === w.word ? ' picked' : ''}${wrong === w.word ? ' wrong' : ''}${d ? ' dragging' : ''}`}
              style={d ? { transform: `translate(${d.dx}px, ${d.dy}px)` } : undefined}
              onPointerDown={(e) => down(e, w)}
              onPointerMove={move}
              onPointerUp={(e) => up(e, w)}
              onPointerCancel={() => setDrag(null)}
            >
              <span aria-hidden>{w.icon}</span>
              <b>{w.word}</b>
            </button>
          )
        })}
        {done && <div className="eton-result ok" role="status">🎉 All right! 全部放对啦！</div>}
      </div>

      <div className="eton-sort-boxes">
        {(['land', 'water'] as const).map((g) => (
          <div
            key={g}
            ref={(el) => { boxes.current[g] = el }}
            className={`eton-sort-box ${g}${picked ? ' ready' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={g === 'land' ? 'Land 陆地' : 'Water 水'}
            onClick={() => tapBox(g)}
          >
            <h4>{g === 'land' ? '⛰️ Land' : '💧 Water'}</h4>
            <div className="eton-sort-in">
              {card.words.filter((w) => placed[w.word] === g).map((w) => (
                <span key={w.word} className="eton-sort-done"><span aria-hidden>{w.icon}</span> {w.word}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {done && <button className="btn btn-ghost" onClick={() => { setPlaced({}); setOrder(shuffled(card.words)) }}>↺ 再玩一次</button>}
    </div>
  )
}

/**
 * am / are / is 配对：屏幕上一个代词，下面三个按钮。点对了填进去、读出整句；
 * 点错了那个按钮晃一下，可以再选。6 个代词打乱问两轮，全对算完成。
 */
export function MatchView({ card }: { card: MatchCard }) {
  const deal = () => [0, 1].flatMap((round) => shuffled(card.items).map((item) => ({ ...item, sentence: item.sentences[round] })))
  const [queue, setQueue] = useState(deal)
  const [at, setAt] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [right, setRight] = useState(false)
  const [misses, setMisses] = useState(0)
  const done = at >= queue.length
  const q = queue[Math.min(at, queue.length - 1)]

  const choose = (word: string) => {
    if (right || done) return
    if (word !== q.answer) {
      setWrong(word)
      setMisses((n) => n + 1)
      speakEn(`${q.who} ${word}?`)
      window.setTimeout(() => setWrong((x) => (x === word ? null : x)), 500)
      return
    }
    setRight(true)
    speakEn(q.sentence)
    play(at === queue.length - 1 ? 'fanfare' : 'coin')
    window.setTimeout(() => {
      setRight(false)
      setAt((n) => n + 1)
    }, 1500)
  }
  const again = () => {
    setQueue(deal())
    setAt(0)
    setMisses(0)
  }
  // 句子里代词后面的部分：选对以后整句显示出来
  const rest = q.sentence.slice(q.who.length + 1 + q.answer.length)

  return (
    <div className="eton-card">
      <span className="eton-tag">{card.tag}</span>
      <h3 className="eton-topic">🎯 {card.title}</h3>
      {card.tip && <p className="eton-tip">{card.tip}</p>}
      <div className="eton-match-dots" aria-label={`第 ${Math.min(at + 1, queue.length)} 题，共 ${queue.length} 题`}>
        {queue.map((_, i) => <span key={i} className={i < at ? 'on' : i === at ? 'now' : ''} />)}
      </div>
      {done ? (
        <div className="eton-result ok" role="status">
          <span>🎉 All done! {misses ? `${queue.length} 题都答对了，中间改过 ${misses} 次。` : '一次都没错，太棒了！'}</span>
          <button className="btn btn-ghost" onClick={again}>↺ 再玩一次</button>
        </div>
      ) : (
        <>
          <button className={`eton-match-q${right ? ' right' : ''}`} onClick={() => speakEn(right ? q.sentence : q.who)} aria-live="polite">
            <b>{q.who}</b>
            <span className="eton-match-blank">{right ? q.answer : '___'}</span>
            {right && <span className="eton-match-rest">{rest}</span>}
          </button>
          <div className="eton-match-choices">
            {card.choices.map((c) => (
              <button key={c} className={`eton-match-choice${wrong === c ? ' wrong' : ''}${right && c === q.answer ? ' right' : ''}`} onClick={() => choose(c)}>
                {c}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
