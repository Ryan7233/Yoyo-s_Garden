import { expect, test, type Page } from '@playwright/test'
import { onboard } from './helpers'

// 场景可以滑动时（比如 iPad mini），可滑的一侧边缘出现渐隐和小箭头；滑到头就消失。
// 那一侧藏着的内容不到 24px 时不提示
const MIN = 24

async function canScroll(page: Page) {
  return page.locator('.scene-scroll').evaluate((el, m) => ({
    up: el.scrollTop >= m,
    down: el.scrollHeight - el.clientHeight - el.scrollTop >= m,
    left: el.scrollLeft >= m,
    right: el.scrollWidth - el.clientWidth - el.scrollLeft >= m,
  }), MIN)
}

/** 每个方向：能滑就有提示（渐隐 + 箭头），不能滑就没有 */
async function expectHintsMatch(page: Page) {
  const can = await canScroll(page)
  for (const dir of ['up', 'down', 'left', 'right'] as const) {
    const hint = page.locator(`.scroll-hint.${dir}`)
    if (can[dir]) {
      await expect(hint, `${dir} 提示`).toBeVisible()
      await expect(hint.locator('.scroll-hint-arrow')).toBeVisible()
    } else await expect(hint, `${dir} 不提示`).toHaveCount(0)
  }
  return can
}

test('iPad mini：小屋能往下滑时显示提示，滑到底后换成往上', async ({ page }) => {
  await page.setViewportSize({ width: 1133, height: 744 })
  await onboard(page)
  await page.getByRole('button', { name: '进入小屋' }).click()
  await expect(page.locator('.floor-grid')).toBeVisible()
  const before = await expectHintsMatch(page)
  expect(before.down, '小屋在 iPad mini 上可以往下滑').toBe(true)
  // 提示不挡点击
  await expect(page.locator('.scroll-hint.down')).toHaveCSS('pointer-events', 'none')

  await page.locator('.scene-scroll').evaluate((el) => el.scrollTo({ top: el.scrollHeight }))
  await expect(page.locator('.scroll-hint.down')).toHaveCount(0)
  await expect(page.locator('.scroll-hint.up')).toBeVisible()
  await expectHintsMatch(page)
})

test('iPad mini 竖屏的花园：能往右滑时提示，滑到最右换成往左', async ({ page }) => {
  await page.setViewportSize({ width: 744, height: 1133 })
  await onboard(page)
  expect((await expectHintsMatch(page)).right).toBe(true)
  await page.locator('.scene-scroll').evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
  await expect(page.locator('.scroll-hint.right')).toHaveCount(0)
  await expect(page.locator('.scroll-hint.left')).toBeVisible()
})

test('iPad Pro 横屏的花园只多出几像素，不显示提示', async ({ page }) => {
  await onboard(page)
  await expect(page.locator('.garden-name')).toBeVisible()
  await expectHintsMatch(page)
  await expect(page.locator('.scroll-hint')).toHaveCount(0)
})
