import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

test('默认是平面花园，种下的花在切换木作 3D、返回和刷新后仍在原格', async ({ page }) => {
  await onboard(page)
  const plots = page.getByRole('button', { name: '地块', exact: true })
  await expect(plots).toHaveCount(6)
  const cells = await plots.evaluateAll(nodes => nodes.map(node => {
    const { x, y } = node.getBoundingClientRect()
    return { x, y }
  }))
  expect(new Set(cells.map(p => p.x)).size).toBe(3)
  expect(new Set(cells.map(p => p.y)).size).toBe(2)
  await plots.first().tap()
  await page.getByRole('button', { name: /向日葵/ }).tap()
  const flower = page.locator('.ground .plant')
  await expect(flower).toHaveCSS('grid-column-start', '4')
  await expect(flower).toHaveCSS('grid-row-start', '5')

  await page.getByRole('button', { name: '木作 3D' }).tap()
  await page.getByRole('button', { name: '旋转九十度' }).tap()
  await expect(page.locator('.woodland canvas')).toBeVisible()
  await page.getByRole('button', { name: '平面 2D' }).tap()
  await expect(flower).toHaveCSS('grid-column-start', '4')
  await expect(flower).toHaveCSS('grid-row-start', '5')
  await page.reload()
  await expect(flower).toHaveCount(1)
  await plots.first().tap()
  await expect(page.getByRole('dialog').getByRole('heading', { name: '向日葵' })).toBeVisible()
})
