import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { setupChild } from './actions'
import { answerChallenge, recordRaise, setRaiseGoal } from './courage'
import { exportBackup, parseBackup } from './backup'
import { balanceOf } from '../engine/ledger'
import { RAISE_HAND_TASK_ID } from '../data/tasks'

const MON = new Date(2026, 9, 19, 18, 0)

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, MON)
  childId = child.id
})

describe('向日葵举手', () => {
  it('每次都记；每天第一次给种子、打卡（孩子自报、不发金币）', async () => {
    const coins = balanceOf(await db.ledger.toArray())
    const a = await recordRaise(childId, 'wrong', '2026-10-19', MON)
    const b = await recordRaise(childId, 'right', '2026-10-19', MON)
    expect(a).toMatchObject({ seed: true, weekDays: 1, goal: 2, reachedNow: false })
    expect(b).toMatchObject({ seed: false, weekDays: 1 })
    expect((await db.handRaises.toArray()).map((r) => r.result).sort()).toEqual(['right', 'wrong'])
    const recs = await db.taskRecords.where('taskId').equals(RAISE_HAND_TASK_ID).toArray()
    expect(recs).toHaveLength(1)
    expect(recs[0].status).toBe('done')
    expect(balanceOf(await db.ledger.toArray())).toEqual(coins)
  })

  it('一周两天就达标：向日葵长出来；连续两周后问要不要挑战，选“要”才提高', async () => {
    await recordRaise(childId, 'right', '2026-10-13', MON)
    const w1 = await recordRaise(childId, 'notCalled', '2026-10-15', MON)
    expect(w1).toMatchObject({ reachedNow: true, grew: { from: 0, to: 1 }, askChallenge: false })
    // 同一周再多举手不重复达标
    expect(await recordRaise(childId, 'right', '2026-10-16', MON)).toMatchObject({ reachedNow: false })

    await recordRaise(childId, 'right', '2026-10-19', MON)
    const w2 = await recordRaise(childId, 'wrong', '2026-10-21', MON)
    expect(w2).toMatchObject({ reachedNow: true, grew: null, askChallenge: true })
    expect((await db.settings.get('settings'))!.courageWeeks).toEqual(['2026-10-12', '2026-10-19'])

    await answerChallenge(false, '2026-10-21')
    expect((await db.settings.get('settings'))!.raiseGoal).toBeUndefined()
    await answerChallenge(true, '2026-10-21')
    expect((await db.settings.get('settings'))!.raiseGoal).toBe(3)
    // 随时可以改回 2
    await setRaiseGoal(2)
    expect((await db.settings.get('settings'))!.raiseGoal).toBe(2)
  })

  it('举手记录和周目标进备份；旧版本备份没有这张表也能导入', async () => {
    await recordRaise(childId, 'right', '2026-10-19', MON)
    const file = await exportBackup(MON)
    expect(file.tables.handRaises).toHaveLength(1)
    const old = structuredClone(file) as unknown as { schemaVersion: number; tables: Record<string, unknown> }
    old.schemaVersion = 5
    delete old.tables.handRaises
    expect(parseBackup(JSON.stringify(old)).tables.handRaises).toEqual([])
    const bad = structuredClone(file)
    ;(bad.tables.handRaises[0] as { result: unknown }).result = 'maybe'
    expect(() => parseBackup(JSON.stringify(bad))).toThrow(/handRaises/)
  })
})
