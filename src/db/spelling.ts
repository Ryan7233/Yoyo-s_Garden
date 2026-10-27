// 拼写本：家长加词、孩子在 YoYo Words 里默写完交回结果、家长看笔迹确认和批改
import { db, uid } from './schema'
import type { SpellKind, SpellResult, SpellSession } from '../data/types'
import { SPELLING_QUIZ_TASK_ID, SPELLING_TASK_ID } from '../data/tasks'
import { applySpellResult, newSpellWord, regradeSpellResult, requeueWord } from '../engine/spelling'
import { childReportTask, confirmRecord } from './actions'

export interface NewSpellWord { word: string; kind: SpellKind; zh?: string }
/** 默写页交回来的一个词：多带一张第一次写的笔迹 */
export type SubmittedResult = SpellResult & { ink?: string }

/** 笔迹留 30 天 */
const INK_KEEP_DAYS = 30

/** 加词；已经在拼写本里的词跳过，返回实际加上的词 */
export async function addSpellWords(childId: string, list: NewSpellWord[], today: string, now = new Date()): Promise<string[]> {
  return db.transaction('rw', db.spellWords, async () => {
    const added: string[] = []
    for (const item of list) {
      const exists = await db.spellWords.where('[childId+word]').equals([childId, item.word]).first()
      if (exists) continue
      const zh = item.zh?.trim()
      await db.spellWords.add(newSpellWord({
        id: uid(), childId, word: item.word, kind: item.kind, addedAt: now.toISOString(), ...(zh ? { zh } : {}),
      }, today))
      added.push(item.word)
    }
    return added
  })
}

export async function removeSpellWord(id: string) {
  await db.spellWords.delete(id)
}

/** 家长手动把一个词放回下周重新学 */
export async function requeueSpellWord(id: string, today: string) {
  await db.transaction('rw', db.spellWords, async () => {
    const w = await db.spellWords.get(id)
    if (w) await db.spellWords.put(requeueWord(w, today))
  })
}

/** 拼写相关的读写放进同一个事务（包括打卡和发奖励用到的表） */
function spellTx<T>(fn: () => Promise<T>): Promise<T> {
  return db.transaction('rw', [db.spellWords, db.spellSessions, db.spellInks, db.tasks, db.taskRecords, db.ledger, db.dayPlans], fn)
}

/**
 * 孩子默写完交回结果：存记录和笔迹、更新每个词的复习进度，并像“我完成了”一样等家长确认。
 * 周末小听写交卷时还没判对错（checkedBy: none），等家长批改后再把写错的放回下周。
 * 摸底只记录，不动拼写本也不打卡。
 */
export function submitSpellSession(
  childId: string, mode: SpellSession['mode'], submitted: SubmittedResult[], today: string, now = new Date(),
): Promise<SpellSession> {
  return spellTx(async () => {
    const id = uid()
    const at = now.toISOString()
    const results: SpellResult[] = []
    for (const { ink, ...r } of submitted) {
      const w = await db.spellWords.where('[childId+word]').equals([childId, r.word]).first()
      results.push(w ? { ...r, stepBefore: w.step } : r)
      if (ink) await db.spellInks.put({ id: `${id}:${r.word}`, childId, sessionId: id, word: r.word, dataUrl: ink, at })
      if (!w || mode === 'baseline') continue
      if (mode === 'daily') await db.spellWords.put(applySpellResult(w, r, today))
      else if (r.checkedBy !== 'none' && r.attempts && !r.firstTry) await db.spellWords.put(requeueWord(w, today))
    }
    const session: SpellSession = { id, childId, date: today, mode, at, results }
    if (mode === 'quiz') session.graded = results.every((r) => r.checkedBy !== 'none')
    if (mode !== 'baseline') {
      const record = await childReportTask(childId, mode === 'daily' ? SPELLING_TASK_ID : SPELLING_QUIZ_TASK_ID, today, now)
      session.recordId = record.id
    }
    await db.spellSessions.add(session)
    const cutoff = new Date(now.getTime() - INK_KEEP_DAYS * 86_400_000).toISOString()
    await db.spellInks.where('at').below(cutoff).delete()
    return session
  })
}

/** 每日拼写：家长看了笔迹，改判某个词，按改过的结果重新排期 */
export function correctSpellResult(sessionId: string, word: string, ok: boolean) {
  return spellTx(async () => {
    const s = await db.spellSessions.get(sessionId)
    if (!s || s.mode !== 'daily') return
    const results = s.results.map((r) => (r.word === word ? { ...r, firstTry: ok, done: ok, checkedBy: 'parent' as const } : r))
    await db.spellSessions.put({ ...s, results })
    const r = results.find((x) => x.word === word)
    const w = await db.spellWords.where('[childId+word]').equals([s.childId, word]).first()
    if (r && w) await db.spellWords.put(regradeSpellResult(w, r, s.date))
  })
}

/** 周末小听写：家长逐个判完，写错的放回下周，然后确认打卡 */
export function gradeSpellQuiz(sessionId: string, marks: Record<string, boolean>, now = new Date()) {
  return spellTx(async () => {
    const s = await db.spellSessions.get(sessionId)
    if (!s || s.mode !== 'quiz' || s.graded) return
    const results = s.results.map((r) => ({ ...r, firstTry: !!marks[r.word], done: !!marks[r.word], checkedBy: 'parent' as const }))
    await db.spellSessions.put({ ...s, results, graded: true })
    for (const r of results) {
      if (r.firstTry) continue
      const w = await db.spellWords.where('[childId+word]').equals([s.childId, r.word]).first()
      if (w) await db.spellWords.put(requeueWord(w, s.date))
    }
    if (s.recordId) await confirmRecord(s.recordId, now)
  })
}

/** 这次默写的笔迹，按词 */
export async function inksOf(sessionId: string): Promise<Map<string, string>> {
  const list = await db.spellInks.where('sessionId').equals(sessionId).toArray()
  return new Map(list.map((i) => [i.word, i.dataUrl]))
}
