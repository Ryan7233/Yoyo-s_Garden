import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, SCHEMA_VERSION, db, useDatabase } from './schema'
import { addTask, parentMarkDone, reconcileFrom, setupChild, updateTask } from './actions'
import { ensureDayPlans } from './plans'
import { exportBackup, importBackup, parseBackup } from './backup'
import { progressStats } from './garden'
import { balanceOf } from '../engine/ledger'
import { defaultTasks } from '../data/tasks'

const SAT = new Date(2026, 9, 17, 18, 0)
const SUN = new Date(2026, 9, 18, 9, 0)
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

describe('改任务不改变过去', () => {
  it('第二天把别的任务改成必做，前一天的全勤和奖励保持', async () => {
    for (const t of ['start-on-time', 'english-speaking', 'english-reading', 'drink-water']) await parentMarkDone(childId, t, DAY, SAT)
    expect(await balance()).toEqual({ coin: 23, drop: 11 })
    expect((await progressStats(childId)).allDoneDays).toBe(1)

    await updateTask('math', { required: true }, SUN)
    await addTask(childId, { name: '跳绳', icon: '🪢', category: 'sport', confirmMode: 'parent', schedule: { kind: 'daily' }, coins: 2, drops: 1, required: true }, SUN)
    await reconcileFrom(childId, DAY, SUN)
    expect(await balance()).toEqual({ coin: 23, drop: 11 })
    expect((await progressStats(childId)).allDoneDays).toBe(1)
    expect(await db.dayPlans.get([childId, DAY])).toMatchObject({ required: ['start-on-time', 'english-speaking', 'english-reading', 'drink-water'] })
  })

  it('今天的配置不冻结，改了当天就生效', async () => {
    await ensureDayPlans(childId, SAT)
    expect(await db.dayPlans.count()).toBe(0)
    await ensureDayPlans(childId, SUN)
    expect((await db.dayPlans.toArray()).map((p) => p.date)).toEqual([DAY])
  })
})

describe('数据库升级', () => {
  it(`从版本 1 升级到 ${SCHEMA_VERSION}：先做快照，再冻结过去每天的配置，原数据不变`, async () => {
    const name = `v1-${Math.random()}`
    const v1 = new Dexie(name)
    v1.version(1).stores({
      children: 'id', tasks: 'id, childId, order', exercises: 'id, childId',
      taskRecords: 'id, childId, taskId, date, status, [childId+date]', exerciseRecords: 'id, childId, exerciseId, date, status',
      ledger: 'id, childId, at, date, refId, reason', inventory: 'id, childId, catalogId, [childId+catalogId]',
      placed: 'id, childId, scene', plants: 'id, childId, scene', plots: '[childId+x+y], childId',
      unlocks: 'id, childId, kind, refId, [childId+kind+refId]', wishes: 'childId', settings: 'id', videos: 'id', snapshots: 'id, at',
    })
    const createdAt = new Date(Date.now() - 3 * 86400_000)
    await v1.table('children').add({ id: 'c', name: '小花', gardenName: '园', houseColor: '#fff', theme: 'mint', mascotName: '苞', createdAt: createdAt.toISOString() })
    await v1.table('tasks').bulkAdd(defaultTasks('c'))
    await v1.table('ledger').add({ id: 'l1', childId: 'c', at: createdAt.toISOString(), currency: 'coin', amount: 7, reason: 'gift' })
    v1.close()

    const next = new GardenDB(name)
    useDatabase(next)
    await next.open()
    const snaps = (await next.snapshots.toArray()).sort((a, b) => a.schemaVersion - b.schemaVersion)
    expect(snaps.map((s) => s.schemaVersion)).toEqual([1, 2, 5, 6])
    expect(JSON.parse(snaps[0].data).ledger).toHaveLength(1)
    expect(await next.ledger.get('l1')).toMatchObject({ amount: 7 })
    expect(await next.dayPlans.count()).toBeGreaterThanOrEqual(3)
  })
})

describe('备份', () => {
  it('任务配置快照进备份；旧版本备份没有这张表也能导入', async () => {
    await ensureDayPlans(childId, SUN)
    const file = await exportBackup(SUN)
    expect(file.tables.dayPlans).toHaveLength(1)

    const old = structuredClone(file) as unknown as { schemaVersion: number; tables: Record<string, unknown> }
    old.schemaVersion = 1
    delete old.tables.dayPlans
    const parsed = parseBackup(JSON.stringify(old))
    expect(parsed.tables.dayPlans).toEqual([])
    await importBackup(parsed)
    expect(await db.dayPlans.count()).toBe(0)
  })
})
