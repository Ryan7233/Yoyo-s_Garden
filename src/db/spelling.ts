// 拼写本：家长加词、孩子在 YoYo Words 里默写完交回结果
import { db, uid } from './schema'
import type { SpellKind, SpellResult, SpellSession } from '../data/types'
import { SPELLING_QUIZ_TASK_ID, SPELLING_TASK_ID } from '../data/tasks'
import { applySpellResult, newSpellWord, requeueWord } from '../engine/spelling'
import { childReportTask } from './actions'

export interface NewSpellWord { word: string; kind: SpellKind; zh?: string }

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

/**
 * 孩子默写完交回结果：存一条记录、更新每个词的复习进度，并像“我完成了”一样等家长确认。
 * 周末小听写里第一次没写对的词放回下周。摸底只记录，不动拼写本也不发奖励。
 */
export async function submitSpellSession(
  childId: string, mode: SpellSession['mode'], results: SpellResult[], today: string, now = new Date(),
): Promise<SpellSession> {
  const session: SpellSession = { id: uid(), childId, date: today, mode, at: now.toISOString(), results }
  await db.transaction('rw', [db.spellWords, db.spellSessions], async () => {
    await db.spellSessions.add(session)
    if (mode === 'baseline') return
    for (const r of results) {
      const w = await db.spellWords.where('[childId+word]').equals([childId, r.word]).first()
      if (!w) continue
      if (mode === 'daily') await db.spellWords.put(applySpellResult(w, r, today))
      else if (r.attempts && !r.firstTry) await db.spellWords.put(requeueWord(w, today))
    }
  })
  if (mode !== 'baseline') {
    await childReportTask(childId, mode === 'daily' ? SPELLING_TASK_ID : SPELLING_QUIZ_TASK_ID, today, now)
  }
  return session
}
