import { expect, test } from '@playwright/test'
import { dismissNotices, onboard, seedDb } from './helpers'

// 提示弹得晚（比如设备慢、脚本加载慢）时，关提示的步骤也要等到它出现再关，不能靠超时猜
test('到账提示出现得晚，也能在第一次运行时关掉', async ({ page }) => {
  await onboard(page)
  await seedDb(page, { ledger: [{ id: 'late-bonus', at: new Date().toISOString(), currency: 'coin', amount: 3, reason: 'bonus', note: '测试' }] })
  await dismissNotices(page, ['收下啦'])

  // 再来一次，这次让应用脚本晚 3 秒才到
  await seedDb(page, { ledger: [{ id: 'late-bonus-2', at: new Date().toISOString(), currency: 'coin', amount: 2, reason: 'bonus', note: '再测' }] })
  await page.route('**/assets/*.js', async (route) => {
    await new Promise((r) => setTimeout(r, 3000))
    await route.continue()
  })
  await page.reload({ waitUntil: 'commit' })
  await dismissNotices(page, ['收下啦'])
  await expect(page.locator('.garden-name')).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
