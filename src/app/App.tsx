import { useEffect } from 'react'
import { useStore } from './store'
import { Onboarding } from './Onboarding'
import { Layout } from './Layout'
import { requestPersistence } from '../db/schema'
import { touchClock } from '../db/actions'

export function App() {
  const loaded = useStore((s) => s.loaded)
  const child = useStore((s) => s.child)
  const load = useStore((s) => s.load)
  const tick = useStore((s) => s.tick)

  useEffect(() => {
    void requestPersistence()
    void touchClock().then(load)
    const t = setInterval(tick, 30_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tick()
        void touchClock().then(load)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load, tick])

  useEffect(() => {
    document.documentElement.dataset.theme = child?.theme ?? 'sakura'
  }, [child?.theme])

  if (!loaded) return null
  if (!child) return <Onboarding />
  return <Layout />
}
