import { useState } from 'react'
import { useStore, act } from '../../app/store'
import type { SpellKind, SpellResult, SpellSession } from '../../data/types'
import {
  BASELINE_WORDS, SIGHT_WORDS, SPELL_KIND_LABEL, baselineAdvice, classifySpellWord, normalizeSpellWord,
} from '../../data/spelling'
import { SPELL_DONE_STEP, SPELL_NEW_PER_DAY, addedOn, spellQueue, toSchoolDay } from '../../engine/spelling'
import { formatDay } from '../../engine/taskDay'
import { addSpellWords, removeSpellWord, requeueSpellWord, submitSpellSession } from '../../db/spelling'
import { SpellingSheet } from './SpellingSheet'

const MODE_LABEL: Record<SpellSession['mode'], string> = { daily: '每日拼写', quiz: '周末小听写', baseline: '摸底' }

/** 家长：拼写本。牛津树读完挑 3 个词加进来，复习和周末听写自动排 */
export function SpellingPanel() {
  const { child, spellWords, spellSessions, today } = useStore()
  const [word, setWord] = useState('')
  const [zh, setZh] = useState('')
  const [kind, setKind] = useState<SpellKind | null>(null)
  const [msg, setMsg] = useState('')
  const [baseline, setBaseline] = useState(false)
  if (!child) return null

  const normalized = normalizeSpellWord(word)
  const guessed = normalized ? classifySpellWord(normalized) : null
  const finalKind = kind ?? guessed
  const exists = !!normalized && spellWords.some((w) => w.word === normalized)
  const startDay = toSchoolDay(today)
  const addedToday = addedOn(spellWords, today)
  const queue = spellQueue(spellWords, startDay)
  const suggestions = SIGHT_WORDS.filter((w) => !spellWords.some((x) => x.word === w)).slice(0, 10)
  const lastBaseline = [...spellSessions].reverse().find((s) => s.mode === 'baseline')
  const recent = [...spellSessions].reverse().filter((s) => s.mode !== 'baseline').slice(0, 5)
  const words = [...spellWords].sort((a, b) => a.step - b.step || a.due.localeCompare(b.due))

  const add = async () => {
    if (!normalized || !finalKind || exists) return
    await act(() => addSpellWords(child.id, [{ word: normalized, kind: finalKind, zh }], today))
    setMsg(`已加入 ${normalized}`)
    setWord('')
    setZh('')
    setKind(null)
    setTimeout(() => setMsg(''), 2000)
  }

  const finishBaseline = async (results: SpellResult[]) => {
    setBaseline(false)
    await act(() => submitSpellSession(child.id, 'baseline', results, today))
  }

  return (
    <div className="panel">
      <h3 className="panel-day">{startDay === today ? '今天' : `${formatDay(startDay)}（下个上学日）`}要练的</h3>
      <p className="modal-text">
        新词 <b className="num">{queue.fresh.length}</b> 个{queue.fresh.length ? `（${queue.fresh.map((w) => w.word).join('、')}）` : ''}，
        复习 <b className="num">{queue.review.length}</b> 个{queue.review.length ? `（${queue.review.map((w) => w.word).join('、')}）` : ''}。
        孩子点“拼 3 个词”会打开 YoYo Words 的手写默写。
      </p>

      <h3 className="panel-day">加词（今天已加 <span className="num">{addedToday}</span> 个，每天 {SPELL_NEW_PER_DAY} 个就够）</h3>
      <div className="spell-add">
        <input className="input" value={word} maxLength={20} placeholder="英文，比如 sunny" autoCapitalize="none" autoCorrect="off" spellCheck={false}
          onChange={(e) => { setWord(e.target.value); setKind(null) }} />
        <input className="input zh" value={zh} maxLength={12} placeholder="中文（可不填）" onChange={(e) => setZh(e.target.value)} />
        <button className="btn btn-primary" disabled={!normalized || exists} onClick={add}>加入</button>
      </div>
      {normalized && (
        <div className="chips" aria-label="这个词属于哪一类">
          {(['phonics', 'sight', 'other'] as const).map((k) => (
            <button key={k} className={`chip${finalKind === k ? ' active' : ''}`} onClick={() => setKind(k)}>{SPELL_KIND_LABEL[k]}</button>
          ))}
        </div>
      )}
      {exists && <p className="spell-warn">这个词已经在拼写本里了。</p>}
      {!exists && finalKind === 'other' && (
        <p className="spell-warn">这个词不太符合拼读规律，也不是高频词：认识、会说就够了，确定要拼吗？确定的话照样点“加入”。</p>
      )}
      {addedToday >= SPELL_NEW_PER_DAY && <p className="spell-warn">今天已经有 {addedToday} 个新词了，再多会挤掉阅读和口语的时间。</p>}
      {msg && <p className="pop">✓ {msg}</p>}
      <div className="chips" aria-label="常用高频词">
        {suggestions.map((w) => <button key={w} className="chip" onClick={() => { setWord(w); setKind(null) }}>{w}</button>)}
      </div>

      <h3 className="panel-day">摸底</h3>
      <p className="modal-text">
        念 10 个简单词（{BASELINE_WORDS.join('、')}）让孩子写，家长在旁边看着点对错。
        {lastBaseline && (
          <> 上次（{formatDay(lastBaseline.date, today)}）写对 <b className="num">{lastBaseline.results.filter((r) => r.firstTry).length} / {lastBaseline.results.length}</b>：
            {baselineAdvice(lastBaseline.results.filter((r) => r.firstTry).length, lastBaseline.results.length)}</>
        )}
      </p>
      <button className="btn btn-soft" onClick={() => setBaseline(true)}>开始摸底</button>

      {recent.length > 0 && (
        <>
          <h3 className="panel-day">最近的默写</h3>
          {recent.map((s) => {
            const missed = s.results.filter((r) => r.attempts && !r.firstTry).map((r) => r.word)
            return (
              <div key={s.id} className="row">
                <div className="row-main">
                  <div className="row-title">{formatDay(s.date, today)} · {MODE_LABEL[s.mode]} · 一次写对 <span className="num">{s.results.filter((r) => r.firstTry).length} / {s.results.length}</span></div>
                  <div className="row-sub">{missed.length ? `没一次写对：${missed.join('、')}` : '全部一次写对'}</div>
                </div>
              </div>
            )
          })}
        </>
      )}

      <h3 className="panel-day">拼写本（{spellWords.length} 个词）</h3>
      {words.length === 0 && <p className="empty-state">还没有词。读完牛津树，挑 3 个符合拼读规律的短词或高频词加进来。</p>}
      {words.map((w) => (
        <div key={w.id} className="row">
          <div className="row-main">
            <div className="row-title">{w.word}{w.zh && <span className="hint"> {w.zh}</span>} <span className={`spell-kind ${w.kind}`}>{SPELL_KIND_LABEL[w.kind]}</span></div>
            <div className="row-sub">
              <span className="spell-steps" aria-label={`第 ${Math.min(w.step, SPELL_DONE_STEP)} 步`}>
                {Array.from({ length: SPELL_DONE_STEP }, (_, i) => (i < w.step ? '●' : '○')).join('')}
              </span>
              {' '}{w.step >= SPELL_DONE_STEP ? '学完了' : w.step === 0 ? `${formatDay(w.due, today)}学新词` : `${formatDay(w.due, today)}复习`}
              {w.misses > 0 && ` · 听写错过 ${w.misses} 次`}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => act(() => requeueSpellWord(w.id, today))}>放回下周</button>
          <button className="btn btn-ghost" aria-label={`删除 ${w.word}`} onClick={() => act(() => removeSpellWord(w.id))}>删除</button>
        </div>
      ))}

      {baseline && (
        <SpellingSheet
          items={BASELINE_WORDS.map((w) => ({ word: w, kind: 'review' as const }))}
          finishLabel="交回家长模式"
          onResult={finishBaseline}
          onClose={() => setBaseline(false)}
        />
      )}
    </div>
  )
}
