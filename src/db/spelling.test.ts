import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { confirmRecord, setupChild } from './actions'
import { addSpellWords, correctSpellResult, gradeSpellQuiz, inksOf, markSpellKnown, submitSpellSession, topUpSpellWords } from './spelling'
import { updateTask } from './actions'
import { exportBackup, parseBackup } from './backup'
import { balanceOf } from '../engine/ledger'
import { defaultTasks, RAISE_HAND_TASK_ID, SPELLING_HINT, SPELLING_HINT_V3, SPELLING_QUIZ_TASK_ID, SPELLING_TASK_ID, SPELLING_TASK_IDS } from '../data/tasks'
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

describe('看笔迹确认和批改', () => {
  const INK = 'data:image/jpeg;base64,AAAA'

  it('笔迹单独存、不进备份；家长改判后按改过的结果重新排期', async () => {
    await addSpellWords(childId, [{ word: 'sunny', kind: 'phonics' }], MON_DAY, MON)
    const s = await submitSpellSession(childId, 'daily', [
      { word: 'sunny', kind: 'new', firstTry: true, done: true, attempts: 1, checkedBy: 'self', ink: INK },
    ], MON_DAY, MON)
    expect(s.recordId).toBeTruthy()
    expect(s.results[0]).toMatchObject({ stepBefore: 0 })
    expect('ink' in s.results[0]).toBe(false)
    expect(await inksOf(s.id)).toEqual(new Map([['sunny', INK]]))
    expect('spellInks' in (await exportBackup(MON)).tables).toBe(false)
    expect(await db.spellWords.where('[childId+word]').equals([childId, 'sunny']).first()).toMatchObject({ step: 1, due: '2026-10-20' })

    // 她自己判对了，家长看笔迹其实不对：回到新词，明天再学
    await correctSpellResult(s.id, 'sunny', false)
    expect(await db.spellWords.where('[childId+word]').equals([childId, 'sunny']).first()).toMatchObject({ step: 0, due: '2026-10-20' })
    expect((await db.spellSessions.get(s.id))!.results[0]).toMatchObject({ firstTry: false, checkedBy: 'parent' })
    // 再改回来
    await correctSpellResult(s.id, 'sunny', true)
    expect(await db.spellWords.where('[childId+word]').equals([childId, 'sunny']).first()).toMatchObject({ step: 1, due: '2026-10-20' })
  })

  it('周末小听写交卷时不判对错；家长批改后写错的放回下周并自动确认发奖励', async () => {
    await addSpellWords(childId, [{ word: 'hot', kind: 'phonics' }, { word: 'jump', kind: 'phonics' }], MON_DAY, MON)
    const s = await submitSpellSession(childId, 'quiz', [
      { word: 'hot', kind: 'review', firstTry: false, done: false, attempts: 1, checkedBy: 'none', ink: INK },
      { word: 'jump', kind: 'review', firstTry: false, done: false, attempts: 1, checkedBy: 'none' },
    ], SAT_DAY, MON)
    expect(s.graded).toBe(false)
    expect((await db.spellWords.where('[childId+word]').equals([childId, 'jump']).first())!.misses).toBe(0)
    expect(await db.taskRecords.get(s.recordId!)).toMatchObject({ status: 'pending' })

    const before = balanceOf(await db.ledger.toArray()).coin
    await gradeSpellQuiz(s.id, { hot: true, jump: false }, MON)
    expect(await db.spellWords.where('[childId+word]').equals([childId, 'jump']).first()).toMatchObject({ step: 0, startDay: '2026-10-26', misses: 1 })
    expect((await db.spellWords.where('[childId+word]').equals([childId, 'hot']).first())!.misses).toBe(0)
    expect(await db.spellSessions.get(s.id)).toMatchObject({ graded: true })
    expect(await db.taskRecords.get(s.recordId!)).toMatchObject({ status: 'done' })
    expect(balanceOf(await db.ledger.toArray()).coin).toBe(before + 5)
    // 重复批改不会再放一次
    await gradeSpellQuiz(s.id, { hot: false, jump: false }, MON)
    expect((await db.spellWords.where('[childId+word]').equals([childId, 'hot']).first())!.misses).toBe(0)
  })

  it('笔迹 30 天后清理', async () => {
    await addSpellWords(childId, [{ word: 'hot', kind: 'phonics' }], MON_DAY, MON)
    const old = await submitSpellSession(childId, 'baseline', [{ word: 'cat', kind: 'review', firstTry: true, done: true, attempts: 1, ink: INK }], MON_DAY, MON)
    const later = new Date(MON.getTime() + 31 * 86_400_000)
    await submitSpellSession(childId, 'baseline', [{ word: 'dog', kind: 'review', firstTry: true, done: true, attempts: 1, ink: INK }], '2026-11-19', later)
    expect((await inksOf(old.id)).size).toBe(0)
    expect(await db.spellInks.count()).toBe(1)
  })
})

describe('自动给词', () => {
  const book = async () => (await db.spellWords.where('childId').equals(childId).sortBy('addedAt'))

  it('上学日补够 3 个，同一天再打开不重复补；周末和关掉任务时不补', async () => {
    expect(await topUpSpellWords(childId, MON_DAY, MON)).toEqual(['cat', 'dog', 'red'])
    expect(await topUpSpellWords(childId, MON_DAY, MON)).toEqual([])
    expect((await book()).map((w) => [w.word, w.source, w.zh])).toEqual([['cat', 'auto', '猫'], ['dog', 'auto', '狗'], ['red', 'auto', '红色']])
    expect(await topUpSpellWords(childId, SAT_DAY, MON)).toEqual([])
    await updateTask(SPELLING_TASK_ID, { enabled: false }, MON)
    await db.spellWords.clear()
    expect(await topUpSpellWords(childId, MON_DAY, MON)).toEqual([])
  })

  it('家长加的词优先：顶替今天自动给、还没练的词', async () => {
    await topUpSpellWords(childId, MON_DAY, MON)
    await addSpellWords(childId, [{ word: 'sunny', kind: 'phonics' }], MON_DAY, MON)
    expect((await book()).map((w) => w.word).sort()).toEqual(['cat', 'dog', 'sunny'])
    // 已经练过的自动词不会被顶掉
    await submitSpellSession(childId, 'daily', [{ word: 'cat', kind: 'new', firstTry: true, done: true, attempts: 1 }], MON_DAY, MON)
    await addSpellWords(childId, [{ word: 'said', kind: 'sight' }, { word: 'jump', kind: 'phonics' }], MON_DAY, MON)
    expect((await book()).map((w) => w.word).sort()).toEqual(['cat', 'jump', 'said', 'sunny'])
  })

  it('会写，跳过以后，下一个上学日照样补够 3 个新词', async () => {
    await topUpSpellWords(childId, MON_DAY, MON)
    const cat = (await book()).find((w) => w.word === 'cat')!
    await markSpellKnown(cat.id, MON_DAY)
    expect(await topUpSpellWords(childId, MON_DAY, MON)).toEqual(['six'])
  })
})

describe('数据库升级到版本 5', () => {
  it('“拼 3 个词”的旧说明换成新说明，家长改过的不动', async () => {
    const make = async (hint: string) => {
      const name = `v4-${Math.random()}`
      const v4 = new Dexie(name)
      v4.version(4).stores({
        children: 'id', tasks: 'id, childId, order', exercises: 'id, childId',
        taskRecords: 'id, childId, taskId, date, status, [childId+date]', exerciseRecords: 'id, childId, exerciseId, date, status',
        ledger: 'id, childId, at, date, refId, reason', inventory: 'id, childId, catalogId, [childId+catalogId]',
        placed: 'id, childId, scene', plants: 'id, childId, scene', plots: '[childId+x+y], childId',
        unlocks: 'id, childId, kind, refId, [childId+kind+refId]', wishes: 'childId', settings: 'id', videos: 'id', snapshots: 'id, at',
        dayPlans: '[childId+date], childId', spellWords: 'id, childId, [childId+word]', spellSessions: 'id, childId, date',
        spellInks: 'id, childId, sessionId, at',
      })
      await v4.table('tasks').bulkAdd(defaultTasks('c').map((t) => (t.id === SPELLING_TASK_ID ? { ...t, hint } : t)))
      v4.close()
      const next = new GardenDB(name)
      await next.open()
      return (await next.tasks.get(SPELLING_TASK_ID))!.hint
    }
    expect(await make(SPELLING_HINT_V3)).toBe(SPELLING_HINT)
    expect(await make('我自己写的说明')).toBe('我自己写的说明')
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
    const oldTasks = defaultTasks('c').filter((t) => !SPELLING_TASK_IDS.includes(t.id) && t.id !== RAISE_HAND_TASK_ID)
    await v2.table('children').add({ id: 'c', name: '小花', gardenName: '园', houseColor: '#fff', theme: 'mint', mascotName: '苞', createdAt: createdAt.toISOString() })
    await v2.table('tasks').bulkAdd(oldTasks)
    v2.close()

    const next = new GardenDB(name)
    useDatabase(next)
    await next.open()
    const tasks = await next.tasks.where('childId').equals('c').sortBy('order')
    expect(tasks.slice(-3).map((t) => [t.id, t.order, t.required])).toEqual([
      [SPELLING_TASK_ID, oldTasks.length, false],
      [SPELLING_QUIZ_TASK_ID, oldTasks.length + 1, false],
      [RAISE_HAND_TASK_ID, oldTasks.length + 2, false],
    ])
    const plans = await next.dayPlans.where('childId').equals('c').toArray()
    expect(plans.length).toBeGreaterThanOrEqual(4)
    expect(plans.every((p) => !p.more.some((id) => SPELLING_TASK_IDS.includes(id) || id === RAISE_HAND_TASK_ID))).toBe(true)
    expect(plans.some((p) => p.date === addDays(toTaskDay(new Date()), -1))).toBe(true)
    expect((await next.snapshots.toArray()).map((s) => s.schemaVersion).sort()).toEqual([2, 5])
  })
})
