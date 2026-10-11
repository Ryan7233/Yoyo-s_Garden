import { expect, test, type Page } from '@playwright/test'

// SPEC 10.4：首次引导 → 完成一项自报任务 → 家长确认一项任务 → 买种子 → 种下 → 浇水 → 摆放一件家具 → 刷新后状态保持

async function pin(page: Page, code = '1234') {
  for (const d of code) await page.locator('.pin-key', { hasText: d }).first().click()
}

async function closeSheet(page: Page) {
  await page.getByRole('button', { name: '关闭' }).first().click()
}

const coins = (page: Page) => page.locator('#coin-target')

test('从首次引导到刷新后状态保持', async ({ page }) => {
  await page.goto('./')

  // 首次引导
  await page.getByPlaceholder('你的名字').fill('小花')
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByPlaceholder('比如：彩虹花园').fill('彩虹园')
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByPlaceholder('精灵的名字').fill('苞苞')
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByText('请爸爸妈妈设置 4 位密码')).toBeVisible()
  await pin(page)
  await expect(page.getByText('再输入一次确认')).toBeVisible()
  await pin(page)
  await expect(page.getByText('最后一步：添加到主屏幕')).toBeVisible()
  await page.locator('.onboarding-card button.btn-primary').last().click()
  await expect(page.locator('.garden-name')).toHaveText('彩虹园')
  await expect(coins(page)).toHaveText('0')

  // 自报任务：立即到账
  await page.getByRole('button', { name: /任务/ }).click()
  await page.getByRole('button', { name: /更多任务/ }).click()
  const washUp = page.locator('.task-card', { hasText: '自己洗澡刷牙' })
  await washUp.getByRole('button', { name: '我完成了' }).click()
  await expect(washUp.getByText('已完成')).toBeVisible()
  await expect(coins(page)).toHaveText('2')

  // 家长确认任务：先进待确认
  const start = page.locator('.task-card', { hasText: '说开始就开始' })
  await start.getByRole('button', { name: '我完成了' }).click()
  await expect(start.getByText('等爸爸妈妈确认')).toBeVisible()
  await closeSheet(page)
  await page.getByRole('button', { name: '家长模式' }).click()
  await pin(page)
  await page.locator('.row', { hasText: '说开始就开始' }).getByRole('button', { name: '确认' }).click()
  await expect(page.getByText('没有待确认的任务')).toBeVisible()
  await page.getByRole('button', { name: '退出' }).click()
  await page.getByRole('button', { name: '收下啦' }).click()
  await expect(coins(page)).toHaveText('7')

  // 买种子
  await page.getByRole('button', { name: /商店/ }).click()
  await page.locator('.shop-card', { hasText: '雏菊' }).getByRole('button', { name: /买/ }).click()
  await page.getByRole('button', { name: '买！' }).click()
  await expect(coins(page)).toHaveText('2')
  await closeSheet(page)

  // 种下、浇水
  await page.getByRole('button', { name: '地块' }).first().click()
  await page.locator('.seed-btn', { hasText: '雏菊' }).click()
  await expect(page.locator('.plant')).toHaveCount(1)
  await page.getByRole('button', { name: '地块' }).first().click()
  await page.getByRole('button', { name: /浇水/ }).click()
  await expect(page.locator('.balance-pill.drop .title')).toHaveText('6')

  // 摆放一件家具：进小屋，把椅子收回背包，再摆到新位置
  await page.getByRole('button', { name: '进入小屋' }).click()
  await page.getByRole('button', { name: /装扮/ }).click()
  await page.locator('.floor-item', { has: page.getByText('🪑') }).click()
  await page.getByRole('button', { name: /收回背包/ }).click()
  await page.locator('.tray-item', { hasText: '椅子' }).click()
  await page.locator('[data-scene=indoor][data-layer=ground][data-x="6"][data-y="0"]').click()
  await page.getByRole('button', { name: '完成' }).click()

  // 刷新后状态保持
  await page.reload()
  await expect(coins(page)).toHaveText('2')
  await expect(page.locator('.balance-pill.drop .title')).toHaveText('6')
  await expect(page.locator('.plant')).toHaveCount(1)
  await page.getByRole('button', { name: '进入小屋' }).click()
  await expect(page.locator('.floor-item', { has: page.getByText('🪑') })).toHaveCSS('grid-column-start', '7')
})
