import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { setupChild } from './actions'
import { exportBackup } from './backup'
import {
  confirmExerciseRecord, logExercise, logExerciseWithVideo, rejectExerciseRecord, revokeExerciseRecord, updateExercise,
} from './exercise'
import { balanceOf } from '../engine/ledger'
import { progressStats } from './garden'

const SAT = new Date(2026, 9, 17, 18, 0)
const DAY = '2026-10-17'

async function balance() {
  return balanceOf(await db.ledger.where('childId').equals(childId).toArray())
}

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, SAT)
  childId = child.id
})

describe('运动打卡', () => {
  it('日常练习直接到账，不进待确认', async () => {
    const r = await logExercise(childId, 'jump-rope', DAY, 105, 'none', SAT)
    expect(r.status).toBe('done')
    expect(r.isPersonalBest).toBe(false)
    expect(await balance()).toEqual({ coin: 3, drop: 5 })
  })

  it('家长当场见证破纪录 +5，并计入星星树的刷新纪录次数', async () => {
    const r = await logExercise(childId, 'plank', DAY, 35, 'parent', SAT)
    expect(r).toMatchObject({ isPersonalBest: true, witness: 'parent', recordAttempt: true })
    expect((await balance()).coin).toBe(8)
    expect((await progressStats(childId)).personalBests).toBe(1)
  })

  it('五项都做了额外 +3 金币 +2 水滴', async () => {
    for (const [id, v] of [['jump-rope', 10], ['sit-reach', -3], ['plank', 5], ['hang', 5], ['sit-up', 5]] as const) {
      await logExercise(childId, id, DAY, v, 'none', SAT)
    }
    expect(await balance()).toEqual({ coin: 13, drop: 7 })
  })

  it('录视频：日常奖励先到账，纪录待确认；确认后发纪录奖励并删除视频', async () => {
    const r = await logExerciseWithVideo(childId, 'hang', DAY, 12, new Blob(['v']), SAT)
    expect(r.status).toBe('pending')
    expect((await balance()).coin).toBe(2)
    expect(await db.videos.count()).toBe(1)
    await confirmExerciseRecord(r.id, SAT)
    const after = await db.exerciseRecords.get(r.id)
    expect(after).toMatchObject({ status: 'done', isPersonalBest: true })
    expect(after?.videoBlobId).toBeUndefined()
    expect(await db.videos.count()).toBe(0)
    expect((await balance()).coin).toBe(7)
  })

  it('驳回视频不扣日常奖励，不算纪录，视频删除', async () => {
    const r = await logExerciseWithVideo(childId, 'hang', DAY, 12, new Blob(['v']), SAT)
    await rejectExerciseRecord(r.id, '脚碰到地了')
    expect(await db.exerciseRecords.get(r.id)).toMatchObject({ status: 'rejected', isPersonalBest: false, note: '脚碰到地了' })
    expect(await db.videos.count()).toBe(0)
    expect((await balance()).coin).toBe(2)
  })

  it('视频不进备份', async () => {
    await logExerciseWithVideo(childId, 'hang', DAY, 12, new Blob(['v']), SAT)
    const data = await exportBackup(SAT)
    expect(JSON.stringify(data)).not.toContain('"videos"')
  })

  it('撤销误录：扣回奖励，当天这项可以重新拿基础奖励', async () => {
    const r = await logExercise(childId, 'jump-rope', DAY, 105, 'none', SAT)
    await revokeExerciseRecord(r.id, SAT)
    expect((await balance()).coin).toBe(0)
    await logExercise(childId, 'jump-rope', DAY, 90, 'none', SAT)
    expect((await balance()).coin).toBe(2)
  })

  it('家长调整目标和频率', async () => {
    await updateExercise('hang', { target: 10, days: [1, 3, 5] })
    expect(await db.exercises.get('hang')).toMatchObject({ target: 10, days: [1, 3, 5] })
    await logExercise(childId, 'hang', '2026-10-16', 12, 'none', SAT)
    expect((await balance()).coin).toBe(3)
  })
})
