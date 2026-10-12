import { expect, type Page } from '@playwright/test'

export async function pin(page: Page, code = '1234') {
  for (const d of code) await page.locator('.pin-key', { hasText: d }).first().click()
}

/** 走一遍真实的首次引导 */
export async function onboard(page: Page) {
  await page.goto('./')
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
}

export async function closeSheet(page: Page) {
  await page.getByRole('button', { name: '关闭' }).first().click()
}

/** 直接写 IndexedDB 准备测试数据（只在测试里用） */
export async function seedDb(page: Page, rows: Record<string, Record<string, unknown>[]>) {
  await page.evaluate(async (rows) => {
    const db = await new Promise<IDBDatabase>((res) => {
      const r = indexedDB.open('little-garden')
      r.onsuccess = () => res(r.result)
    })
    const childId = await new Promise<string>((res) => {
      const r = db.transaction('children').objectStore('children').getAll()
      r.onsuccess = () => res(r.result[0].id)
    })
    const tx = db.transaction(Object.keys(rows), 'readwrite')
    for (const [table, list] of Object.entries(rows)) for (const row of list) tx.objectStore(table).put({ ...row, childId })
    await new Promise((res) => (tx.oncomplete = res))
  }, rows)
  await page.reload()
  await expect(page.locator('.garden-name')).toBeVisible()
}

/**
 * 依次关掉预期的提示（一次只弹一个）：每个都等它的对话框出现、点按钮、再等它消失，
 * 不靠超时猜。buttons 是每个提示的按钮名，比如 ['收下啦', '太好啦']。
 */
export async function dismissNotices(page: Page, buttons: (string | RegExp)[]) {
  for (const name of buttons) {
    const dialog = page.getByRole('dialog').filter({ has: page.getByRole('button', { name }) })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name }).click()
    await expect(dialog).toHaveCount(0)
  }
}
