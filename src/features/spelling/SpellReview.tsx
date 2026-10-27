import { useEffect, useState } from 'react'
import { act } from '../../app/store'
import type { SpellSession, TaskRecord } from '../../data/types'
import { SPELLING_QUIZ_TASK_ID, SPELLING_TASK_IDS } from '../../data/tasks'
import { correctSpellResult, gradeSpellQuiz, inksOf } from '../../db/spelling'

/** 某条拼写打卡对应的那次默写（老记录没有 recordId 时，按日期和类型找最近一次） */
export function sessionOfRecord(record: TaskRecord, sessions: SpellSession[]): SpellSession | undefined {
  if (!SPELLING_TASK_IDS.includes(record.taskId)) return undefined
  const mode = record.taskId === SPELLING_QUIZ_TASK_ID ? 'quiz' : 'daily'
  return sessions.find((s) => s.recordId === record.id)
    ?? [...sessions].reverse().find((s) => !s.recordId && s.date === record.date && s.mode === mode)
}

/** 周末小听写交卷后还没批改：不能直接确认 */
export function needsGrading(session: SpellSession | undefined): boolean {
  return session?.mode === 'quiz' && !session.graded
}

/**
 * 家长确认拼写任务时看笔迹：
 * - 每日拼写：孩子自己判过，看笔迹不对可以改判，复习排期跟着改
 * - 周末小听写：逐个判对错，批改完自动确认，写错的放回下周
 */
export function SpellReview({ session, editable }: { session: SpellSession; editable: boolean }) {
  const [inks, setInks] = useState<Map<string, string>>(new Map())
  const [marks, setMarks] = useState<Record<string, boolean>>({})
  useEffect(() => {
    let alive = true
    inksOf(session.id).then((m) => { if (alive) setInks(m) })
    return () => { alive = false }
  }, [session.id])

  const grading = needsGrading(session)
  const allMarked = session.results.every((r) => r.word in marks)

  return (
    <div className="spell-review">
      <p className="row-sub">
        {grading
          ? '小听写：她只写没对答案，请看笔迹逐个判对错。批改完会自动确认，写错的放进下周重新学。'
          : '看看她写的样子：她自己判错了的话可以改，复习安排会跟着改。'}
      </p>
      <div className="spell-review-grid">
        {session.results.map((r) => {
          const ink = inks.get(r.word)
          const ok = grading ? marks[r.word] : r.firstTry
          return (
            <div key={r.word} className={`spell-ink card${ok === true ? ' ok' : ok === false ? ' no' : ''}`}>
              {ink ? <img src={ink} alt={`${r.word} 的笔迹`} /> : <div className="spell-ink-empty">没有笔迹（纸上写的）</div>}
              <div className="spell-ink-word">{r.word}</div>
              {!grading && (
                <div className="spell-ink-who">
                  {r.checkedBy === 'parent' ? '你改过' : r.attempts > 1 ? `她自己判：写了 ${r.attempts} 次` : '她自己判'}
                  {r.attempts > 1 && <span className="hint">（图是第一次写的）</span>}
                </div>
              )}
              {editable && (
                <div className="chips">
                  <button
                    className={`chip${ok === true ? ' active' : ''}`}
                    onClick={() => (grading ? setMarks({ ...marks, [r.word]: true }) : act(() => correctSpellResult(session.id, r.word, true)))}
                  >✅ 对</button>
                  <button
                    className={`chip${ok === false ? ' active' : ''}`}
                    onClick={() => (grading ? setMarks({ ...marks, [r.word]: false }) : act(() => correctSpellResult(session.id, r.word, false)))}
                  >❌ 不对</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {grading && editable && (
        <button className="btn btn-primary" disabled={!allMarked} onClick={() => act(() => gradeSpellQuiz(session.id, marks))}>
          ✓ 批改完成并确认（对 {Object.values(marks).filter(Boolean).length} / {session.results.length}）
        </button>
      )}
    </div>
  )
}
