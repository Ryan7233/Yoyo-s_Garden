import { expect, test } from '@playwright/test'
import { closeSheet, dismissNotices, onboard, seedDb } from './helpers'

// 收获、插花、运动计时、拖拽摆放、切换场景时的选择状态、刷新后恢复

test('收获、插花、运动计时、拖拽摆放与刷新后恢复', async ({ page }) => {
  await onboard(page)
  const now = new Date().toISOString()
  await seedDb(page, {
    plants: [{ id: 'sun', scene: 'outdoor', x: 3, y: 4, catalogId: 'seed-sunflower', plantedAt: now, waterCount: 3, stage: 3 }],
    ledger: [{ id: 'gift-test', at: now, currency: 'coin', amount: 100, reason: 'bonus', note: '测试' }],
    inventory: [{ id: 'inv-bench', catalogId: 'out-bench', count: 1 }],
  })
  await dismissNotices(page, ['收下啦', '太好啦'])

  // 收获：点成熟的向日葵
  await page.getByRole('button', { name: '地块' }).first().click()
  await page.getByRole('button', { name: /收获/ }).click()
  await expect(page.locator('.plant')).toHaveCount(0)
  // 第一次收获会得到徽章，先看完“好消息”
  await expect(page.getByText('第一次收获')).toBeVisible()
  await dismissNotices(page, ['太好啦'])
  await page.getByRole('button', { name: /背包/ }).click()
  await expect(page.locator('.bag-card', { hasText: '向日葵' }).filter({ hasNotText: '种子' })).toContainText('×1')
  await closeSheet(page)

  // 插花：进小屋点花瓶，选向日葵
  await page.getByRole('button', { name: '进入小屋' }).click()
  await page.locator('[data-item="in-vase"]').click()
  await page.locator('.seed-btn', { hasText: '向日葵' }).click()
  await expect(page.locator('[data-item="in-vase"] .vase-flower')).toBeVisible()
  await page.getByRole('button', { name: '回到花园' }).click()

  // 运动：60 秒倒计时会走，正计时点“停”自动记秒数
  await page.getByRole('button', { name: /任务/ }).click()
  await page.getByRole('button', { name: /更多任务/ }).click()
  await page.getByRole('button', { name: '去运动' }).click()
  await page.locator('.ex-card', { hasText: '跳绳' }).click()
  await page.getByRole('button', { name: /开始/ }).click()
  await expect(page.locator('.ex-clock')).not.toHaveText('60', { timeout: 3000 })
  await page.getByRole('button', { name: '不做了' }).click()
  await page.getByRole('button', { name: '返回' }).click()
  await page.locator('.ex-card', { hasText: '平板支撑' }).click()
  await page.getByRole('button', { name: /开始/ }).click()
  await page.waitForTimeout(1300)
  await page.getByRole('button', { name: /停/ }).click()
  // 第一次成绩就是纪录：选“先不用”照常记录
  await page.getByRole('button', { name: /先不用/ }).click()
  await expect(page.getByText('获得')).toBeVisible()
  await page.getByRole('button', { name: '好的' }).click()
  await expect(page.locator('.ex-card', { hasText: '平板支撑' })).toContainText('今天做过了')
  await page.getByRole('button', { name: '返回' }).click()
  await closeSheet(page)

  // 装扮：在小屋拿起东西后切到花园，手里的东西和预览要清空
  await page.getByRole('button', { name: /装扮/ }).click()
  await page.locator('.tray-item', { hasText: '长椅' }).click()
  await expect(page.locator('.tray-steps li.on')).toContainText('长椅')
  await page.getByRole('button', { name: /去小屋/ }).click()
  await expect(page.locator('.tray-steps li.on')).toContainText('拿起物品')
  await expect(page.locator('.place-preview')).toHaveCount(0)
  await page.getByRole('button', { name: /去花园/ }).click()

  // 拖拽：把长椅从工具盒拖到 (8, 1)
  const from = await page.locator('.tray-item', { hasText: '长椅' }).boundingBox()
  // 格子只在拿着东西时出现，所以按网格位置算出 (8, 1) 的中心
  const grid = (await page.locator('.ground').boundingBox())!
  const tx = grid.x + (8.5 / 12) * grid.width
  const ty = grid.y + (1.5 / 8) * grid.height
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2)
  await page.mouse.down()
  await page.mouse.move(tx, ty, { steps: 12 })
  await expect(page.locator('.place-preview.good')).toBeVisible()
  await page.mouse.up()
  await expect(page.locator('[data-item="out-bench"]')).toHaveCSS('grid-column-start', '9')
  await page.getByRole('button', { name: '完成装扮' }).click()

  // 刷新后恢复
  await page.reload()
  await expect(page.locator('[data-item="out-bench"]')).toHaveCSS('grid-column-start', '9')
  await expect(page.locator('[data-item="out-bench"]')).toHaveCSS('grid-row-start', '2')
  await page.getByRole('button', { name: '进入小屋' }).click()
  await expect(page.locator('[data-item="in-vase"] .vase-flower')).toBeVisible()
})
