import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { childReportTask, confirmRecord, parentMarkDone, setupChild } from './actions'
import { balanceOf } from '../engine/ledger'
import { cardRecords } from '../engine/rewards'
import { tasksForDay } from '../engine/schedule'
import { taskRates, lastNDays, dayCompletion } from '../engine/stats'
import { livePlan } from '../engine/plans'
import { ENGLISH_CLASS_HINT, ENGLISH_CLASS_NAME, ENGLISH_CLASS_V6, WEEK7_TASK_IDS, defaultTasks } from '../data/tasks'

// 2026-10-19 周一 … 2026-10-25 周日
const MON = new Date(2026, 9, 19, 18, 0)
const at = (d: number) => new Date(2026, 9, d, 18, 0)
const day = (d: number) => `2026-10-${d}`

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  childId = (await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, MON)).id
})

describe('新任务的安排', () => {
  it('外教课每天必做；伊顿课只在周一；棒球周六周日各一张；伊顿作业这周每天都显示、不算必做', async () => {
    const tasks = await db.tasks.toArray()
    const ids = (d: number) => {
      const p = tasksForDay(tasks, day(d))
      return { required: p.required.map((t) => t.id), more: p.more.map((t) => t.id) }
    }
    expect(tasks.find((t) => t.id === 'english-speaking')).toMatchObject({ name: ENGLISH_CLASS_NAME, schedule: { kind: 'daily' }, required: true })
    for (const d of [19, 24, 25]) expect(ids(d).required).toContain('english-speaking')
    expect(ids(19).more).toContain('eton-class')
    expect(ids(20).more).not.toContain('eton-class')
    expect(ids(24).more).toContain('baseball')
    expect(ids(25).more).toContain('baseball')
    expect(ids(23).more).not.toContain('baseball')
    for (const d of [19, 22, 25]) expect(ids(d).more).toContain('eton-homework')
  })
})

describe('伊顿作业：这一周做一次就行', () => {
  it('周三做了，这周其他天显示“已完成”，不能再领一次；下周一重新开始', async () => {
    const coins = () => db.ledger.toArray().then((l) => balanceOf(l).coin)
    const before = await coins()
    const r = await childReportTask(childId, 'eton-homework', day(21), at(21))
    expect(r.status).toBe('pending')
    // 同一周再点：还是那一条
    expect((await childReportTask(childId, 'eton-homework', day(23), at(23))).id).toBe(r.id)
    await confirmRecord(r.id, at(21))
    await parentMarkDone(childId, 'eton-homework', day(24), at(24))
    expect(await coins()).toBe(before + 5)
    expect(await db.taskRecords.where('taskId').equals('eton-homework').count()).toBe(1)

    const records = await db.taskRecords.toArray()
    const tasks = await db.tasks.toArray()
    expect(cardRecords(records, tasks, day(25)).get('eton-homework')?.status).toBe('done')
    expect(cardRecords(records, tasks, day(26)).get('eton-homework')).toBeUndefined()
    // 下周可以再做
    expect((await childReportTask(childId, 'eton-homework', day(26), at(26))).id).not.toBe(r.id)
  })

  it('不算每天的完成率；各任务完成率按周算', async () => {
    const r = await childReportTask(childId, 'eton-homework', day(21), at(21))
    await confirmRecord(r.id, at(21))
    const tasks = await db.tasks.toArray()
    const records = await db.taskRecords.toArray()
    const plan = livePlan(tasks)
    expect(dayCompletion(plan, records, day(21)).done).toBe(0)
    const rate = taskRates(plan, records, lastNDays(day(25), 14)).find((x) => x.task.id === 'eton-homework')!
    expect([rate.done, rate.scheduled]).toEqual([1, 2])
  })
})

describe('数据库升级到版本 7', () => {
  it('英语口语课改名成美森外教课、每天必做；补上三个新任务；过去的日子按旧配置冻结', async () => {
    const name = `v6-${Math.random()}`
    const v6 = new Dexie(name)
    v6.version(6).stores({
      children: 'id', tasks: 'id, childId, order', exercises: 'id, childId',
      taskRecords: 'id, childId, taskId, date, status, [childId+date]', exerciseRecords: 'id, childId, exerciseId, date, status',
      ledger: 'id, childId, at, date, refId, reason', inventory: 'id, childId, catalogId, [childId+catalogId]',
      placed: 'id, childId, scene', plants: 'id, childId, scene', plots: '[childId+x+y], childId',
      unlocks: 'id, childId, kind, refId, [childId+kind+refId]', wishes: 'childId', settings: 'id', videos: 'id', snapshots: 'id, at',
      dayPlans: '[childId+date], childId', spellWords: 'id, childId, [childId+word]', spellSessions: 'id, childId, date',
      spellInks: 'id, childId, sessionId, at', handRaises: 'id, childId, date',
    })
    const createdAt = new Date(Date.now() - 10 * 86400_000)
    const old = defaultTasks('c')
      .filter((t) => !WEEK7_TASK_IDS.includes(t.id))
      .map((t) => (t.id === 'english-speaking'
        ? { ...t, name: ENGLISH_CLASS_V6.name, hint: ENGLISH_CLASS_V6.hint, schedule: { kind: 'weekdays' as const, days: [1, 2, 3, 4, 5] } }
        : t))
      .map((t, i) => ({ ...t, order: i }))
    await v6.table('children').add({ id: 'c', name: '小花', gardenName: '园', houseColor: '#fff', theme: 'mint', mascotName: '苞', createdAt: createdAt.toISOString() })
    await v6.table('tasks').bulkAdd(old)
    v6.close()

    const next = new GardenDB(name)
    await next.open()
    expect(await next.tasks.get('english-speaking')).toMatchObject({ name: ENGLISH_CLASS_NAME, hint: ENGLISH_CLASS_HINT, schedule: { kind: 'daily' }, required: true })
    const added = (await next.tasks.where('childId').equals('c').sortBy('order')).slice(-3)
    expect(added.map((t) => [t.id, t.order])).toEqual([['baseball', old.length], ['eton-class', old.length + 1], ['eton-homework', old.length + 2]])
    // 过去的周末：冻结的是旧配置，没有外教课和棒球
    const plans = await next.dayPlans.where('childId').equals('c').toArray()
    const weekend = plans.find((p) => [0, 6].includes(new Date(`${p.date}T12:00:00`).getDay()))!
    expect(weekend.required).not.toContain('english-speaking')
    expect(weekend.more).not.toContain('baseball')
  })
})
