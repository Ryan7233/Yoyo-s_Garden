import { expect, test, type Page } from '@playwright/test'
import { closeSheet, dismissNotices, onboard, pin } from './helpers'

// 儿童触控目标（SPEC 6.1）：孩子会点的地方都不小于 64px，任务卡上的“我完成了”是主按钮 88px

const TAP = 'button, [role=button], a[href], input, select, textarea, [data-scene][data-x]'

/** 当前屏幕上可见、可点、但小于 min 的目标 */
async function smallTargets(page: Page, root = 'body', min = 64) {
  return page.evaluate(
    ({ root, sel, min }) => {
      const out: string[] = []
      for (const scope of document.querySelectorAll(root)) {
        for (const el of scope.querySelectorAll<HTMLElement>(sel)) {
          const r = el.getBoundingClientRect()
          const st = getComputedStyle(el)
          if (r.width === 0 || r.height === 0 || st.visibility === 'hidden' || st.pointerEvents === 'none') continue
          if (el.closest('[aria-hidden=true], [inert]')) continue
          if (r.width < min - 0.5 || r.height < min - 0.5) {
            const name = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 16)
            out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} 「${name}」 ${Math.round(r.width)}×${Math.round(r.height)}`)
          }
        }
      }
      return out
    },
    { root, sel: TAP, min },
  )
}

/** 等打开动画（有限次数的）播完再量 */
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations()
        .filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime ?? Infinity))
        .map((a) => a.finished.catch(() => {})),
    ),
  )
}

async function expectAllBig(page: Page, where: string, root?: string) {
  await settle(page)
  expect.soft(await smallTargets(page, root), where).toEqual([])
}

for (const [device, viewport] of [['iPad Pro 11', null], ['iPad mini', { width: 1133, height: 744 }]] as const) test(`孩子会点的地方都不小于 64px（${device}）`, async ({ page }) => {
  if (viewport) await page.setViewportSize(viewport)
  await onboard(page)
  await expectAllBig(page, '花园')

  // 任务
  await page.getByRole('button', { name: /任务/ }).click()
  await page.getByRole('button', { name: /更多任务/ }).click()
  await expectAllBig(page, '今日任务')
  const btn = page.locator('.task-card .task-btn').first()
  expect.soft((await btn.boundingBox())!.height, '“我完成了”').toBeGreaterThanOrEqual(88)

  // 运动
  await page.locator('.task-card', { hasText: '运动打卡' }).locator('.task-btn').click()
  await expectAllBig(page, '运动打卡')
  await page.locator('.ex-card', { hasText: '平板支撑' }).click()
  await expectAllBig(page, '运动子项')
  await page.getByRole('button', { name: /开始/ }).click()
  await expectAllBig(page, '计时')
  await page.waitForTimeout(1100)
  await page.getByRole('button', { name: /停/ }).click()
  await expectAllBig(page, '挑战纪录')
  await page.getByRole('button', { name: /喊爸爸妈妈来看/ }).click()
  await expectAllBig(page, '家长见证密码')
  await page.getByRole('button', { name: '返回' }).click()
  await page.getByRole('button', { name: /录一段视频/ }).click()
  await expectAllBig(page, '录视频')
  await page.getByRole('button', { name: '返回' }).click()
  await page.getByRole('button', { name: /先不用/ }).click()
  await expectAllBig(page, '运动结果')
  await page.getByRole('button', { name: '好的' }).click()
  await page.locator('.ex-card', { hasText: '坐位体前屈' }).click()
  await expectAllBig(page, '输入成绩')
  await page.goto('./')
  await expect(page.locator('.garden-name')).toBeVisible()

  // 商店（含心愿按钮）、背包、图鉴
  await page.getByRole('button', { name: /商店/ }).click()
  await expect(page.locator('.wish-btn').first()).toBeVisible()
  await expectAllBig(page, '商店')
  for (const tab of await page.locator('.shop-tab').all()) {
    await tab.click()
    await expectAllBig(page, `商店 · ${await tab.textContent()}`)
  }
  await closeSheet(page)
  await page.getByRole('button', { name: /背包/ }).click()
  await expectAllBig(page, '背包')
  await closeSheet(page)
  await page.getByRole('button', { name: /图鉴/ }).click()
  for (const tab of await page.locator('.shop-tab').all()) {
    await tab.click()
    await expectAllBig(page, `图鉴 · ${await tab.textContent()}`)
  }
  await closeSheet(page)

  // 地块：种子选择
  await page.getByRole('button', { name: '地块' }).first().click()
  await expectAllBig(page, '选种子')
  await page.locator('.seed-btn').first().click()
  await page.getByRole('button', { name: '地块' }).first().click()
  await expectAllBig(page, '植物')
  await closeSheet(page)

  // 装扮
  await page.getByRole('button', { name: /装扮/ }).click()
  await expectAllBig(page, '花园装扮')
  await page.locator('[data-item]').first().click()
  await expectAllBig(page, '物品菜单')
  await page.getByRole('button', { name: '好了' }).click()
  await page.getByRole('button', { name: '完成装扮' }).click()

  // 小屋
  await page.getByRole('button', { name: '进入小屋' }).click()
  await expectAllBig(page, '小屋')
  await page.getByRole('button', { name: /装扮/ }).click()
  await expectAllBig(page, '小屋装扮')
  await page.getByRole('button', { name: '完成装扮' }).click()

  // 家长模式里孩子会碰到的：密码键盘、退出，以及退出后的到账提示
  await page.getByRole('button', { name: '家长模式' }).click()
  await expectAllBig(page, '密码键盘')
  await pin(page)
  await expectAllBig(page, '家长模式顶栏', '.parent-head')
  await page.getByRole('button', { name: /加分/ }).click()
  await page.locator('.panel .chip').first().click()
  await page.locator('.panel .btn-big').click()
  await page.getByRole('button', { name: '退出' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectAllBig(page, '到账提示')
  await dismissNotices(page)
})
