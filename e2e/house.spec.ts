import { expect, test, type Page } from '@playwright/test'
import { onboard, seedDb } from './helpers'

// 小屋的空间关系：墙、地板、家具的比例和透视（iPad Pro 11 和 iPad mini 横屏）

async function measure(page: Page) {
  return page.evaluate(() => {
    const h = (sel: string) => document.querySelector(sel)!.getBoundingClientRect().height
    const rows = getComputedStyle(document.querySelector('.floor-grid')!).gridTemplateRows.split(' ').map(parseFloat)
    // 同一种椅子，按所在行取图像高度
    const chairs = [...document.querySelectorAll<HTMLElement>('[data-item="in-chair"]')]
    const art = (row: string) => chairs.find((c) => getComputedStyle(c).gridRowStart === row)!.querySelector('.art')!.getBoundingClientRect().height
    return { room: h('.room'), wall: h('.wall'), rows, back: art('1'), front: art('5') }
  })
}

for (const [device, viewport] of [['iPad Pro 11', { width: 1194, height: 834 }], ['iPad mini', { width: 1133, height: 744 }]] as const) {
  test(`小屋比例与透视（${device}）`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await onboard(page)
    await seedDb(page, {
      placed: [
        { id: 'chair-back', scene: 'indoor', layer: 'ground', catalogId: 'in-chair', x: 2, y: 0, flipped: false },
        { id: 'chair-front', scene: 'indoor', layer: 'ground', catalogId: 'in-chair', x: 2, y: 4, flipped: false },
      ],
    })
    await page.getByRole('button', { name: '进入小屋' }).click()
    await expect(page.locator('.floor-grid')).toBeVisible()
    const m = await measure(page)

    // 墙约占三分之一，不再是一条窄边
    expect(m.wall / m.room, '墙高占比').toBeGreaterThanOrEqual(0.3)
    expect(m.wall / m.room, '墙高占比').toBeLessThanOrEqual(0.45)
    // 地板从里到外逐行变深，最前一行明显比最里一行高；每行仍不小于 64px
    for (let i = 1; i < m.rows.length; i++) expect(m.rows[i]).toBeGreaterThan(m.rows[i - 1])
    expect(m.rows.at(-1)! / m.rows[0], '前后行高比').toBeGreaterThanOrEqual(1.35)
    expect(Math.min(...m.rows)).toBeGreaterThanOrEqual(64)
    // 同一件家具，放在前排比放在最里排看起来大
    expect(m.front / m.back, '前后家具大小比').toBeGreaterThanOrEqual(1.25)
    // 两侧墙角的透视暗影
    await expect(page.locator('.floor-sides')).toBeAttached()
  })
}
