// 拼写本：家长加词、孩子在 YoYo Words 里默写完交回结果、家长看笔迹确认和批改
import { db, uid } from './schema'
import type { SpellKind, SpellResult, SpellSession } from '../data/types'
import { SPELLING_QUIZ_TASK_ID, SPELLING_TASK_ID } from '../data/tasks'
import { SIGHT_WORDS, classifySpellWord } from '../data/spelling'
import { WORDS_KIDS } from '../data/wordsKids'
import {
  SPELL_NEW_PER_DAY, applySpellResult, autoPick, markKnownWord, newSpellWord, regradeSpellResult, requeueWord, spellPath, toSchoolDay,
} from '../engine/spelling'
import { isScheduledOn } from '../engine/schedule'
import { childReportTask, confirmRecord } from './actions'

export interface NewSpellWord { word: string; kind: SpellKind; zh?: string }
/** 默写页交回来的一个词：多带一张第一次写的笔迹 */
export type SubmittedResult = SpellResult & { ink?: string }

/** 笔迹留 30 天 */
const INK_KEEP_DAYS = 30

/** 自动给词的顺序：Words 幼儿词库按拼写难度重排 */
export const SPELL_PATH = spellPath(WORDS_KIDS.map(([word, zh, emoji]) => ({ word, zh, emoji })), SIGHT_WORDS)

/**
 * 家长加词；已经在拼写本里的词跳过，返回实际加上的词。
 * 家长加的词优先：今天的新词超过 3 个时，去掉今天自动给、还没练的词（以后还会按顺序再给）。
 */
export async function addSpellWords(childId: string, list: NewSpellWord[], today: string, now = new Date()): Promise<string[]> {
  return db.transaction('rw', db.spellWords, async () => {
    const added: string[] = []
    for (const item of list) {
      const exists = await db.spellWords.where('[childId+word]').equals([childId, item.word]).first()
      if (exists) continue
      const zh = item.zh?.trim()
      await db.spellWords.add(newSpellWord({
        id: uid(), childId, word: item.word, kind: item.kind, source: 'parent', addedAt: now.toISOString(), ...(zh ? { zh } : {}),
      }, today))
      added.push(item.word)
    }
    const day = toSchoolDay(today)
    const words = await db.spellWords.where('childId').equals(childId).toArray()
    const fresh = words.filter((w) => w.step === 0 && w.due <= day)
    const spare = fresh
      .filter((w) => w.source === 'auto' && w.startDay === day)
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    const extra = Math.min(spare.length, fresh.length - SPELL_NEW_PER_DAY)
    if (extra > 0) await db.spellWords.bulkDelete(spare.slice(0, extra).map((w) => w.id))
    return added
  })
}

/** 上学日打开花园时，今天的新词不够 3 个就按顺序自动补上（“拼 3 个词”关掉或今天没安排时不补） */
export async function topUpSpellWords(childId: string, today: string, now = new Date()): Promise<string[]> {
  return db.transaction('rw', [db.tasks, db.spellWords], async () => {
    const task = await db.tasks.get(SPELLING_TASK_ID)
    if (!task || task.childId !== childId || !isScheduledOn(task, today)) return []
    const words = await db.spellWords.where('childId').equals(childId).toArray()
    const picks = autoPick(words, SPELL_PATH, today)
    // 同一时刻加的几个词，用毫秒错开，保持顺序
    await db.spellWords.bulkAdd(picks.map((p, i) => newSpellWord({
      id: uid(), childId, word: p.word, kind: classifySpellWord(p.word), source: 'auto',
      addedAt: new Date(now.getTime() + i).toISOString(), ...(p.zh ? { zh: p.zh } : {}),
    }, today)))
    return picks.map((p) => p.word)
  })
}

/** 她早就会写：算学完，以后不再出现 */
export async function markSpellKnown(id: string, today: string) {
  await db.transaction('rw', db.spellWords, async () => {
    const w = await db.spellWords.get(id)
    if (w) await db.spellWords.put(markKnownWord(w, today))
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
