import { expect, test } from '@playwright/test'
import { onboard, pin } from './helpers'

// 新建花园前的日子：统计、热力图、全勤日历里显示“无数据”，不计入完成率
test('建园前的日子显示无数据', async ({ page }) => {
  // 2026-10-17 周六 18:00（北京时间）建园
  await page.clock.setFixedTime(new Date('2026-10-17T18:00:00+08:00'))
  await onboard(page)

  // 完成一项自报任务：周六安排了 13 项（不含运动），完成率应是 1/13 ≈ 8%
  await page.getByRole('button', { name: /任务/ }).click()
  await page.getByRole('button', { name: /更多任务/ }).click()
  await page.locator('.task-card', { hasText: '自己洗澡刷牙' }).getByRole('button', { name: '我完成了' }).click()
  await page.getByRole('button', { name: '关闭' }).first().click()

  // 全勤日历：10 月 1 日到 16 日都是无数据
  await page.getByRole('button', { name: /图鉴/ }).click()
  await page.getByRole('button', { name: /全勤日历/ }).click()
  await expect(page.locator('.cal-day.no-data')).toHaveCount(16)
  await expect(page.locator('.cal-day.no-data').first()).toContainText('无数据')
  await page.getByRole('button', { name: '关闭' }).first().click()

  await page.getByRole('button', { name: '家长模式' }).click()
  await pin(page)
  await page.getByRole('button', { name: /统计/ }).click()
  await expect(page.locator('.stat-tile', { hasText: '任务完成率' })).toContainText('8%')
  await expect(page.locator('.heat-cell.no-data')).toHaveCount(6)
  await page.locator('.heat-cell.no-data').first().click()
  await expect(page.locator('.heat-foot')).toContainText('无数据')
})
