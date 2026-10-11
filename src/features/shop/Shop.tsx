import { useEffect, useState } from 'react'
import { useStore, act } from '../../app/store'
import { SEEDS, SPECIAL_SEEDS } from '../../data/plants'
import { OUTDOOR, OUTDOOR_SPECIAL } from '../../data/outdoor'
import { INDOOR, STYLES } from '../../data/indoor'
import { describeUnlock } from '../../data/unlocks'
import type { CatalogItem } from '../../data/types'
import { buyItem, progressStats } from '../../db/garden'
import { isUnlocked, ruleProgress, type ProgressStats } from '../../engine/unlocks'
import { Icon } from '../../ui/Icon'
import { ConfirmDialog } from '../../ui/Modal'
import { toast } from '../../ui/Toast'
import './shop.css'

type Tab = 'seed' | 'outdoor' | 'indoor' | 'style' | 'special'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'seed', label: '种子', icon: '🌱' },
  { id: 'outdoor', label: '户外装饰', icon: '⛲' },
  { id: 'indoor', label: '室内家具', icon: '🛋️' },
  { id: 'style', label: '墙纸地板', icon: '🧱' },
  { id: 'special', label: '特殊', icon: '🌈' },
]

const ITEMS: Record<Tab, CatalogItem[]> = {
  seed: SEEDS,
  outdoor: OUTDOOR,
  indoor: INDOOR.filter((i) => !i.starter),
  style: STYLES.filter((i) => !i.starter),
  special: [...SPECIAL_SEEDS, ...OUTDOOR_SPECIAL],
}

/** 这一版（M2）还不能使用的物品，以及原因 */
function notYet(item: CatalogItem): string | null {
  if (item.plant) {
    if (item.plant.needs === 'pond') return '有池塘后才能种'
    if (item.plant.needs === 'indoor') return '小屋装扮开放后能种'
    return null
  }
  return '装扮功能开放后能买'
}

export function Shop() {
  const { child, balance } = useStore()
  const [tab, setTab] = useState<Tab>('seed')
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [buying, setBuying] = useState<CatalogItem | null>(null)

  useEffect(() => {
    if (child) void progressStats(child.id).then(setStats)
  }, [child])
  if (!child) return null

  return (
    <div className="shop">
      <h2 className="sheet-title">🛍️ 商店</h2>
      <nav className="shop-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`shop-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>
      <div className="shop-grid">
        {ITEMS[tab].map((item) => {
          const locked = item.unlock && stats ? !isUnlocked(item.unlock, stats) : !!item.unlock && !stats
          const later = notYet(item)
          const short = item.price - balance.coin
          return (
            <div key={item.id} className={`shop-card${locked ? ' locked' : ''}`}>
              <div className="shop-icon">
                <Icon icon={item.icon} size={64} />
                {locked && <span className="lock">🔒</span>}
              </div>
              <div className="title shop-name">{item.name}</div>
              {item.note && <div className="shop-note">{item.note}</div>}
              {locked && item.unlock ? (
                <div className="shop-unlock">
                  {describeUnlock(item.unlock)}
                  {stats && <div className="shop-progress">已完成 {Math.min(ruleProgress(item.unlock, stats), item.unlock.count)} / {item.unlock.count}</div>}
                </div>
              ) : later ? (
                <>
                  <div className="price">🪙 {item.price}</div>
                  <div className="shop-note">{later}</div>
                </>
              ) : short > 0 ? (
                <button className="btn" disabled>还差 {short} 金币</button>
              ) : (
                <button className="btn btn-primary" onClick={() => setBuying(item)}>🪙 {item.price} 买</button>
              )}
            </div>
          )
        })}
      </div>
      {buying && (
        <ConfirmDialog
          title={`买一个${buying.name}${buying.plant ? '种子' : ''}？`}
          message={`花 ${buying.price} 金币，买完还剩 ${balance.coin - buying.price} 金币`}
          confirmText="买！"
          cancelText="不买了"
          onCancel={() => setBuying(null)}
          onConfirm={async () => {
            const r = await act(() => buyItem(child.id, buying.id))
            setBuying(null)
            if (r.ok) toast(`${buying.name}${buying.plant ? '种子' : ''}放进背包啦`)
          }}
        />
      )}
    </div>
  )
}
