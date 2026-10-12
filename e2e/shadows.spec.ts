import { expect, test, type Page } from '@playwright/test'
import { closeSheet, onboard, seedDb } from './helpers'

// 次要卡片（任务、运动、商店、背包、图鉴、今日小结）的投影要轻：
// 实心厚边不超过 3px，模糊投影不透明度不超过 0.08、向下偏移不超过 3px

interface Shadow { inset: boolean; y: number; blur: number; alpha: number }

async function shadowsOf(page: Page, selector: string): Promise<Shadow[]> {
  const css = await page.locator(selector).first().evaluate((el) => getComputedStyle(el).boxShadow)
  // Chromium 计算值形如 "rgba(1, 2, 3, 0.4) 0px 3px 0px 0px inset, rgb(...) 0px 5px 0px 0px"
  return css.split(/,(?![^(]*\))/).map((part) => {
    const color = part.match(/rgba?\(([^)]*)\)/)?.[1].split(',').map((n) => parseFloat(n)) ?? [0, 0, 0, 1]
    const nums = part.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g)!.map(parseFloat)
    return { inset: part.includes('inset'), y: nums[1], blur: nums[2], alpha: color[3] ?? 1 }
  })
}

async function expectLight(page: Page, selector: string) {
  const list = (await shadowsOf(page, selector)).filter((s) => !s.inset)
  for (const s of list) {
    if (s.blur === 0) expect.soft(s.y, `${selector} 厚边`).toBeLessThanOrEqual(3)
    else {
      expect.soft(s.alpha, `${selector} 投影浓度`).toBeLessThanOrEqual(0.08)
      expect.soft(s.y, `${selector} 投影偏移`).toBeLessThanOrEqual(3)
    }
  }
}

test('次要卡片的投影减轻', async ({ page }) => {
  await onboard(page)
  // 图鉴里点亮一种植物，才有“已收集”的卡片
  const at = new Date().toISOString()
  await seedDb(page, { unlocks: [{ id: 'codex-sun', kind: 'codex', refId: 'seed-sunflower', at, seenAt: at }] })
  await page.getByRole('button', { name: /任务/ }).click()
  await expectLight(page, '.task-card')
  await expectLight(page, '.today-summary')
  await page.getByRole('button', { name: /更多任务/ }).click()
  await page.locator('.task-card', { hasText: '运动打卡' }).locator('.task-btn').click()
  await expectLight(page, '.ex-card')
  await page.goto('./')
  await page.getByRole('button', { name: /商店/ }).click()
  await expectLight(page, '.shop-card')
  await closeSheet(page)
  await page.getByRole('button', { name: /背包/ }).click()
  await expectLight(page, '.bag-card')
  await closeSheet(page)
  await page.getByRole('button', { name: /图鉴/ }).click()
  await expectLight(page, '.codex-card.got')
})
