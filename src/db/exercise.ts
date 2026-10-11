// 运动打卡操作：记录成绩、破纪录见证、视频确认、家长设置目标（SPEC 4.3）
import { db, uid } from './schema'
import { addEntries, ledgerOf } from './actions'
import type { ExerciseDef, ExerciseRecord } from '../data/types'
import { balanceOf } from '../engine/ledger'
import { revokeEntries } from '../engine/rewards'
import { confirmVideoRecord, exerciseRewardEntries, exercisesForDay, rewardForLog } from '../engine/exercise'

async function context(childId: string, exerciseId: string, day: string) {
  const [defs, records] = await Promise.all([
    db.exercises.where('childId').equals(childId).toArray(),
    db.exerciseRecords.where('childId').equals(childId).toArray(),
  ])
  const def = defs.find((d) => d.id === exerciseId)
  if (!def) throw new Error('运动子项不存在')
  return { def, records, scheduled: exercisesForDay(defs, day) }
}

export type Witness = 'none' | 'parent'

/**
 * 记一次成绩。日常练习直接到账；witness = 'parent' 表示家长当场输 PIN 见证，
 * 超过个人最好就算新纪录。
 */
export async function logExercise(
  childId: string, exerciseId: string, day: string, value: number, witness: Witness, now = new Date(),
): Promise<ExerciseRecord> {
  return db.transaction('rw', [db.exercises, db.exerciseRecords, db.ledger], async () => {
    const { def, records, scheduled } = await context(childId, exerciseId, day)
    const witnessed = witness === 'parent'
    const reward = rewardForLog({ def, value, day, scheduled, records, witnessed })
    const record: ExerciseRecord = {
      id: uid(), childId, exerciseId, date: day, value,
      isPersonalBest: reward.isPersonalBest,
      status: 'done',
      createdAt: now.toISOString(),
      recordAttempt: witnessed,
      witness: witnessed ? 'parent' : undefined,
    }
    await db.exerciseRecords.add(record)
    await addEntries(childId, exerciseRewardEntries(record, reward), now)
    return record
  })
}

/** 录视频挑战纪录：日常练习奖励立即到账，纪录进家长待确认 */
export async function logExerciseWithVideo(
  childId: string, exerciseId: string, day: string, value: number, video: Blob, now = new Date(),
): Promise<ExerciseRecord> {
  return db.transaction('rw', [db.exercises, db.exerciseRecords, db.ledger, db.videos], async () => {
    const { def, records, scheduled } = await context(childId, exerciseId, day)
    const reward = rewardForLog({ def, value, day, scheduled, records, witnessed: false })
    const videoId = uid()
    await db.videos.add({ id: videoId, blob: video, createdAt: now.toISOString() })
    const record: ExerciseRecord = {
      id: uid(), childId, exerciseId, date: day, value,
      isPersonalBest: false,
      status: 'pending',
      createdAt: now.toISOString(),
      recordAttempt: true,
      witness: 'video',
      videoBlobId: videoId,
    }
    await db.exerciseRecords.add(record)
    await addEntries(childId, exerciseRewardEntries(record, reward), now)
    return record
  })
}

async function dropVideo(r: ExerciseRecord): Promise<ExerciseRecord> {
  if (!r.videoBlobId) return r
  await db.videos.delete(r.videoBlobId)
  const { videoBlobId: _, ...rest } = r
  return rest
}

/** 家长看完视频确认：仍是新纪录就发纪录奖励；视频删除 */
export async function confirmExerciseRecord(recordId: string, now = new Date()) {
  await db.transaction('rw', [db.exerciseRecords, db.ledger, db.videos], async () => {
    const r = await db.exerciseRecords.get(recordId)
    if (!r || r.status !== 'pending') return
    const all = await db.exerciseRecords.where('childId').equals(r.childId).toArray()
    const { isPersonalBest, entries } = confirmVideoRecord(r, all)
    await db.exerciseRecords.put({ ...(await dropVideo(r)), status: 'done', isPersonalBest })
    await addEntries(r.childId, entries, now)
  })
}

/** 家长驳回视频：不扣日常练习奖励，只是不算纪录；视频删除 */
export async function rejectExerciseRecord(recordId: string, note: string | undefined) {
  await db.transaction('rw', [db.exerciseRecords, db.videos], async () => {
    const r = await db.exerciseRecords.get(recordId)
    if (!r || r.status !== 'pending') return
    await db.exerciseRecords.put({ ...(await dropVideo(r)), status: 'rejected', isPersonalBest: false, note: note?.trim() || undefined })
  })
}

/** 撤销误录的成绩：扣回这条记录发放的奖励，余额最低扣到 0 */
export async function revokeExerciseRecord(recordId: string, now = new Date()) {
  await db.transaction('rw', [db.exerciseRecords, db.ledger, db.videos], async () => {
    const r = await db.exerciseRecords.get(recordId)
    if (!r || r.status === 'revoked') return
    await db.exerciseRecords.put({ ...(await dropVideo(r)), status: 'revoked', isPersonalBest: false })
    const ledger = await ledgerOf(r.childId)
    await addEntries(r.childId, revokeEntries(r.id, ledger, balanceOf(ledger), r.date), now)
  })
}

export async function getVideo(id: string): Promise<Blob | undefined> {
  return (await db.videos.get(id))?.blob
}

/** 家长设置子项的目标和频率 */
export async function updateExercise(id: string, patch: Partial<Pick<ExerciseDef, 'target' | 'days'>>) {
  await db.exercises.update(id, patch)
}
