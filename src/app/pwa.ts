import { create } from 'zustand'
import { registerSW } from 'virtual:pwa-register'
import { shouldAutoUpdate } from './autoUpdate'

interface PwaState {
  needRefresh: boolean
  update: () => Promise<void>
  check: () => Promise<void>
}

let updateSW: ((reload?: boolean) => Promise<void>) | null = null
let registration: ServiceWorkerRegistration | undefined
/** 这次打开 / 切回前台的时刻 */
let shownAt = Date.now()

/** 有弹窗开着就是孩子正在做事（任务、默写、看课、家长模式） */
const busy = () => document.querySelector('.modal') !== null

/** 有新版本时，刚打开小花园就自动换上；用到一半不刷新，家长模式里也能手动更新 */
export const usePwa = create<PwaState>(() => ({
  needRefresh: false,
  async update() {
    await updateSW?.(true)
  },
  async check() {
    await registration?.update()
  },
}))

export function initPwa() {
  if (!('serviceWorker' in navigator)) return
  updateSW = registerSW({
    onNeedRefresh() {
      usePwa.setState({ needRefresh: true })
      if (shouldAutoUpdate({ sinceShownMs: Date.now() - shownAt, busy: busy() })) void updateSW?.(true)
    },
    onRegisteredSW(_url, r) {
      registration = r
    },
  })
  // 切回前台：之前攒下的新版本马上换；没有的话去查一次，查到了也在窗口期内换
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    shownAt = Date.now()
    if (usePwa.getState().needRefresh && !busy()) void updateSW?.(true)
    else void registration?.update()
  })
}
