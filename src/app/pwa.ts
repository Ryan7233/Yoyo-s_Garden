import { create } from 'zustand'
import { registerSW } from 'virtual:pwa-register'

interface PwaState {
  needRefresh: boolean
  update: () => Promise<void>
  check: () => Promise<void>
}

let updateSW: ((reload?: boolean) => Promise<void>) | null = null
let registration: ServiceWorkerRegistration | undefined

/** 新版本只在家长模式里提示，不在孩子使用中途强制刷新 */
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
    },
    onRegisteredSW(_url, r) {
      registration = r
    },
  })
}
