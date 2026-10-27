import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { confirmRecord, setupChild } from './actions'
import { addSpellWords, submitSpellSession } from './spelling'
import { exportBackup, parseBackup } from './backup'
import { balanceOf } from '../engine/ledger'
import { defaultTasks, SPELLING_QUIZ_TASK_ID, SPELLING_TASK_ID, SPELLING_TASK_IDS } from '../data/tasks'
import { addDays, toTaskDay } from '../engine/taskDay'

const MON = new Date(2026, 9, 19, 18, 0)
const MON_DAY = '2026-10-19'
const SAT_DAY = '2026-10-24'

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, MON)
  childId = child.id
})

describe('拼写本', () => {
  it('加词去重；默写交回后更新复习进度，并等家长确认才发奖励', async () => {
    expect(await addSpellWords(childId, [{ word: 'sunny', kind: 'phonics' }, { word: 'said', kind: 'sight' }], MON_DAY, MON)).toEqual(['sunny', 'said'])
    expect(await addSpellWords(childId, [{ word: 'sunny', kind: 'phonics' }], MON_DAY, MON)).toEqual([])

    const before = balanceOf(await db.ledger.toArray())
    await submitSpellSession(childId, 'daily', [
      { word: 'sunny', kind: 'new', firstTry: true, done: true, attempts: 1 },
      { word: 'said', kind: 'new', firstTry: false, done: false, attempts: 2 },
    ], MON_DAY, MON)

    const words = await db.spellWords.where('childId').equals(childId).toArray()
    expect(words.find((w) => w.word === 'sunny')).toMatchObject({ step: 1, due: '2026-10-20' })
    expect(words.find((w) => w.word === 'said')).toMatchObject({ step: 0, due: '2026-10-20' })
    expect(await db.spellSessions.count()).toBe(1)

    const record = await db.taskRecords.where('taskId').equals(SPELLING_TASK_ID).first()
    expect(record).toMatchObject({ status: 'pending', date: MON_DAY })
    expect(balanceOf(await db.ledger.toArray())).toEqual(before)
    await confirmRecord(record!.id, MON)
    expect(balanceOf(await db.ledger.toArray()).coin).toBe(before.coin + 3)
  })

  it('周末小听写：第一次没写对的放回下周；摸底不动拼写本也不打卡', async () => {
    await addSpellWords(childId, [{ word: 'hot', kind: 'phonics' }, { word: 'jump', kind: 'phonics' }], MON_DAY, MON)
    await submitSpellSession(childId, 'quiz', [
      { word: 'hot', kind: 'review', firstTry: true, done: true, attempts: 1 },
      { word: 'jump', kind: 'review', firstTry: false, done: true, attempts: 2 },
    ], SAT_DAY, MON)
    const jump = await db.spellWords.where('[childId+word]').equals([childId, 'jump']).first()
    expect(jump).toMatchObject({ step: 0, startDay: '2026-10-26', misses: 1 })
    expect(await db.taskRecords.where('taskId').equals(SPELLING_QUIZ_TASK_ID).count()).toBe(1)

    await submitSpellSession(childId, 'baseline', [{ word: 'cat', kind: 'review', firstTry: true, done: true, attempts: 1 }], MON_DAY, MON)
    expect(await db.taskRecords.count()).toBe(1)
  })

  it('拼写本进备份；旧版本备份没有这两张表也能导入', async () => {
    await addSpellWords(childId, [{ word: 'hot', kind: 'phonics' }], MON_DAY, MON)
    const file = await exportBackup(MON)
    expect(file.tables.spellWords).toHaveLength(1)
    const old = structuredClone(file) as unknown as { schemaVersion: number; tables: Record<string, unknown> }
    old.schemaVersion = 2
    delete old.tables.spellWords
    delete old.tables.spellSessions
    const parsed = parseBackup(JSON.stringify(old))
    expect(parsed.tables.spellWords).toEqual([])
    const bad = structuredClone(file)
    ;(bad.tables.spellWords[0] as { step: unknown }).step = 'x'
    expect(() => parseBackup(JSON.stringify(bad))).toThrow(/spellWords/)
  })
})

describe('数据库升级到版本 3', () => {
  it('老档案补上拼写任务；过去没冻结的日子按旧配置冻结，不会多出拼写任务', async () => {
    const name = `v2-${Math.random()}`
    const v2 = new Dexie(name)
    v2.version(2).stores({
      children: 'id', tasks: 'id, childId, order', exercises: 'id, childId',
      taskRecords: 'id, childId, taskId, date, status, [childId+date]', exerciseRecords: 'id, childId, exerciseId, date, status',
      ledger: 'id, childId, at, date, refId, reason', inventory: 'id, childId, catalogId, [childId+catalogId]',
      placed: 'id, childId, scene', plants: 'id, childId, scene', plots: '[childId+x+y], childId',
      unlocks: 'id, childId, kind, refId, [childId+kind+refId]', wishes: 'childId', settings: 'id', videos: 'id', snapshots: 'id, at',
      dayPlans: '[childId+date], childId',
    })
    const createdAt = new Date(Date.now() - 5 * 86400_000)
    const oldTasks = defaultTasks('c').filter((t) => !SPELLING_TASK_IDS.includes(t.id))
    await v2.table('children').add({ id: 'c', name: '小花', gardenName: '园', houseColor: '#fff', theme: 'mint', mascotName: '苞', createdAt: createdAt.toISOString() })
    await v2.table('tasks').bulkAdd(oldTasks)
    v2.close()

    const next = new GardenDB(name)
    useDatabase(next)
    await next.open()
    const tasks = await next.tasks.where('childId').equals('c').sortBy('order')
    expect(tasks.slice(-2).map((t) => [t.id, t.order, t.required])).toEqual([
      [SPELLING_TASK_ID, oldTasks.length, false],
      [SPELLING_QUIZ_TASK_ID, oldTasks.length + 1, false],
    ])
    const plans = await next.dayPlans.where('childId').equals('c').toArray()
    expect(plans.length).toBeGreaterThanOrEqual(4)
    expect(plans.every((p) => !p.more.some((id) => SPELLING_TASK_IDS.includes(id)))).toBe(true)
    expect(plans.some((p) => p.date === addDays(toTaskDay(new Date()), -1))).toBe(true)
    expect((await next.snapshots.toArray()).map((s) => s.schemaVersion)).toEqual([2])
  })
})
