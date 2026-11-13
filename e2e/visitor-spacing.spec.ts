import { expect, test } from '@playwright/test'
import { dismissNotices, onboard, seedDb } from './helpers'

test('三朵向日葵同时吸引蝴蝶和小鸟，访客可以分别点到', async ({ page }) => {
  await onboard(page)
  const plantedAt = new Date().toISOString()
  await seedDb(page, {
    plants: [[3, 4], [4, 5], [5, 5]].map(([x, y], i) => ({
      id: `flower-${i}`, scene: 'outdoor', x, y, catalogId: 'seed-sunflower', plantedAt, waterCount: 3, stage: 3,
    })),
  })
  await dismissNotices(page, ['太好啦'])
  // 量落脚点，等入场动画播完。检查点击区域，而非只有图案的中心点。
  for (const name of ['蝴蝶', '小鸟']) {
    const animal = page.getByRole('button', { name, exact: true })
    await animal.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)))
  }
  const butterfly = page.getByRole('button', { name: '蝴蝶', exact: true })
  const bird = page.getByRole('button', { name: '小鸟', exact: true })
  const a = (await butterfly.boundingBox())!
  const b = (await bird.boundingBox())!
  expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true)
  await butterfly.tap()
  await expect(butterfly.locator('.visitor-say')).toContainText('蝴蝶')
  await bird.tap()
  await expect(bird.locator('.visitor-say')).toContainText('小鸟')
})
