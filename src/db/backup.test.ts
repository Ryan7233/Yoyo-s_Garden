import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { GardenDB, db, useDatabase } from './schema'
import { childReportTask, setupChild } from './actions'
import { exportBackup, importBackup, parseBackup, type BackupFile } from './backup'

const SAT = new Date(2026, 9, 17, 18, 0)
const DAY = '2026-10-17'

let childId = ''
beforeEach(async () => {
  useDatabase(new GardenDB(`test-${Math.random()}`))
  const child = await setupChild({ name: '小花', gardenName: '彩虹园', theme: 'sakura', houseColor: '#FF9EC0', mascotName: '苞苞', pin: '1234' }, SAT)
  childId = child.id
  await childReportTask(childId, 'wash-up', DAY, SAT)
})

/** 导出一份好的备份，按需改坏 */
async function corrupt(edit: (f: BackupFile) => void): Promise<string> {
  const f = structuredClone(await exportBackup(SAT))
  edit(f)
  return JSON.stringify(f)
}
const rows = (f: BackupFile, t: keyof BackupFile['tables']) => f.tables[t] as Record<string, unknown>[]

describe('备份校验', () => {
  it('好的备份能通过', async () => {
    expect(parseBackup(await corrupt(() => {})).app).toBe('little-garden')
  })

  it.each([
    ['流水金额是文字', (f: BackupFile) => { rows(f, 'ledger')[0].amount = '5' }, 'ledger'],
    ['流水金额不是有限数', (f: BackupFile) => { rows(f, 'ledger')[0].amount = null }, 'ledger'],
    ['流水缺少币种', (f: BackupFile) => { delete rows(f, 'ledger')[0].currency }, 'ledger'],
    ['流水币种不认识', (f: BackupFile) => { rows(f, 'ledger')[0].currency = 'gem' }, 'ledger'],
    ['记录缺少 id', (f: BackupFile) => { delete rows(f, 'taskRecords')[0].id }, 'taskRecords'],
    ['记录状态不认识', (f: BackupFile) => { rows(f, 'taskRecords')[0].status = 'maybe' }, 'taskRecords'],
    ['任务的“必做”不是布尔值', (f: BackupFile) => { rows(f, 'tasks')[0].required = 'yes' }, 'tasks'],
    ['任务频率不是对象', (f: BackupFile) => { rows(f, 'tasks')[0].schedule = 'daily' }, 'tasks'],
    ['运动目标是文字', (f: BackupFile) => { rows(f, 'exercises')[0].target = '30' }, 'exercises'],
    ['地块坐标缺失', (f: BackupFile) => { delete rows(f, 'plots')[0].x }, 'plots'],
    ['库存数量是文字', (f: BackupFile) => { rows(f, 'inventory')[0].count = 'two' }, 'inventory'],
    ['摆放物品翻转不是布尔值', (f: BackupFile) => { rows(f, 'placed')[0].flipped = 1 }, 'placed'],
    ['某一行不是对象', (f: BackupFile) => { f.tables.placed.push('oops') }, 'placed'],
    ['重复的 id', (f: BackupFile) => { f.tables.ledger.push({ ...rows(f, 'ledger')[0] }) }, 'ledger'],
    ['设置缺少密码', (f: BackupFile) => { delete rows(f, 'settings')[0].pinHash }, 'settings'],
    ['没有孩子', (f: BackupFile) => { f.tables.children = [] }, 'children'],
    ['没有设置', (f: BackupFile) => { f.tables.settings = [] }, 'settings'],
  ])('拒绝：%s', async (_name, edit, table) => {
    const text = await corrupt(edit)
    expect(() => parseBackup(text)).toThrow(table)
  })
})

describe('导入', () => {
  it('跳过 parseBackup 直接导入坏数据也会被拒绝，原数据不动', async () => {
    const before = await exportBackup(SAT)
    const bad = structuredClone(before)
    ;(bad.tables.ledger[0] as Record<string, unknown>).amount = 'lots'
    await expect(importBackup(bad)).rejects.toThrow('ledger')
    expect((await exportBackup(SAT)).tables).toEqual(before.tables)
  })

  it('写入中途失败整体回滚，原数据不动', async () => {
    const before = await exportBackup(SAT)
    const other = structuredClone(before)
    ;(other.tables.children[0] as Record<string, unknown>).name = '小草'
    db.settings.hook('creating', () => {
      throw new Error('写入失败')
    })
    await expect(importBackup(other)).rejects.toThrow()
    expect((await exportBackup(SAT)).tables).toEqual(before.tables)
  })
})
