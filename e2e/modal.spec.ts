import { expect, test, type Page } from '@playwright/test'
import { onboard, pin } from './helpers'

const focusInDialog = (page: Page) =>
  page.evaluate(() => !!document.activeElement?.closest('[role=dialog]') && document.activeElement !== document.body)

test('弹窗：打开时焦点移进来、Tab 只在弹窗内切换、Esc 关闭、关闭后焦点回到原按钮', async ({ page }) => {
  await onboard(page)
  await page.getByRole('button', { name: '家长模式' }).click()
  await pin(page)
  await page.getByRole('button', { name: /数据/ }).click()
  const opener = page.getByRole('button', { name: '重置', exact: true })
  await opener.focus()
  await opener.press('Enter')
  const dialog = page.getByRole('dialog').filter({ hasText: '真的要重置吗' })
  await expect(dialog).toBeVisible()
  expect(await focusInDialog(page), '打开后焦点在弹窗里').toBe(true)

  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    expect(await focusInDialog(page), `Tab 第 ${i + 1} 次`).toBe(true)
  }
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Shift+Tab')
    expect(await focusInDialog(page), `Shift+Tab 第 ${i + 1} 次`).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
})
