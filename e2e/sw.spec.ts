import { expect, test, type Page } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { dismissNotices, onboard, pin } from './helpers'

// Service Worker（离线与更新，SPEC 9.2）：用 vite preview 跑构建产物，允许 Service Worker
test.use({ serviceWorkers: 'allow' })

const coins = (page: Page) => page.locator('#coin-target')

/** 等 Service Worker 激活并接管当前页面（首次安装后要刷新一次才接管） */
async function waitForSw(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready)
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) {
    await page.reload()
    await expect(page.locator('.garden-name')).toBeVisible()
  }
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
}

async function openParent(page: Page) {
  await page.getByRole('button', { name: '家长模式' }).click()
  await pin(page)
  await expect(page.locator('.parent-head')).toBeVisible()
}

test('离线后刷新仍能打开，数据还在', async ({ page, context }) => {
  await onboard(page)
  await page.getByRole('button', { name: /任务/ }).click()
  await page.getByRole('button', { name: /更多任务/ }).click()
  await page.locator('.task-card', { hasText: '自己洗澡刷牙' }).getByRole('button', { name: '我完成了' }).click()
  await expect(coins(page)).toHaveText('2')
  await page.getByRole('button', { name: '关闭' }).first().click()
  await waitForSw(page)

  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('.garden-name')).toHaveText('彩虹园')
  await expect(coins(page)).toHaveText('2')
  // 换个入口地址（比如从主屏幕图标冷启动）也能打开
  await page.goto('./?source=homescreen')
  await expect(page.locator('.garden-name')).toHaveText('彩虹园')
  await context.setOffline(false)
})

test('发布新版本后，只在家长模式里出现“有新版本”', async ({ page }) => {
  await onboard(page)
  await waitForSw(page)

  // 模拟发布新版本：vite preview 每次请求都读磁盘，直接改构建产物里的 sw.js，测完还原
  const swPath = 'dist/sw.js'
  const original = readFileSync(swPath, 'utf8')
  try {
    writeFileSync(swPath, `${original}\n// 新版本 ${Date.now()}\n`)
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update())
    await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true)
  } finally {
    writeFileSync(swPath, original)
  }

  // 孩子界面不提示、不自动刷新
  await page.waitForTimeout(500)
  await expect(page.getByText(/有新版本/)).toHaveCount(0)
  await expect(page.locator('.garden-name')).toBeVisible()

  // 家长模式里提示，设置里可以更新
  await openParent(page)
  await expect(page.getByText(/有新版本了/)).toBeVisible()
  await page.getByRole('button', { name: /设置/ }).click()
  await expect(page.getByText('有新版本，点击更新')).toBeVisible()
})

test('导出备份再导入后，数据保持一致', async ({ page }) => {
  await onboard(page)
  await waitForSw(page)
  await page.getByRole('button', { name: /任务/ }).click()
  await page.getByRole('button', { name: /更多任务/ }).click()
  await page.locator('.task-card', { hasText: '自己洗澡刷牙' }).getByRole('button', { name: '我完成了' }).click()
  await expect(coins(page)).toHaveText('2')
  await page.getByRole('button', { name: '关闭' }).first().click()

  await openParent(page)
  await page.getByRole('button', { name: /数据/ }).click()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出' }).click()])
  const file = await download.path()
  const exported = JSON.parse(readFileSync(file, 'utf8'))

  // 导出之后又有变化：家长加 2 分
  await page.getByRole('button', { name: /加分/ }).click()
  await page.locator('.panel .chip', { hasText: '主动做家务' }).click()
  await page.locator('.panel .chip', { hasText: '2' }).click()
  await page.locator('.panel .btn-big').click()
  await page.getByRole('button', { name: '退出' }).click()
  await dismissNotices(page, ['收下啦'])
  await expect(coins(page)).toHaveText('4')

  // 导入刚才的备份
  await openParent(page)
  await page.getByRole('button', { name: /数据/ }).click()
  await page.locator('input[type=file]').setInputFiles(file)
  await expect(page.getByText('用这份备份覆盖当前数据？')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('金币 🪙 2')
  await page.getByRole('button', { name: '覆盖导入' }).click()
  await expect(page.getByText('✓ 导入完成')).toBeVisible()

  // 再导出一次，和第一次一模一样
  const [again] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出' }).click()])
  const reExported = JSON.parse(readFileSync(await again.path(), 'utf8'))
  const strip = (f: { tables: Record<string, Record<string, unknown>[]> }) => ({
    ...f.tables,
    settings: f.tables.settings.map(({ lastBackupAt: _a, lastSeenAt: _b, ...s }) => s),
  })
  expect(strip(reExported)).toEqual(strip(exported))

  await page.getByRole('button', { name: '退出' }).click()
  await expect(coins(page)).toHaveText('2')
  await page.reload()
  await expect(coins(page)).toHaveText('2')
})
