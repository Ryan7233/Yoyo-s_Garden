import { useEffect, useState } from 'react'
import { useStore, act } from '../../app/store'
import { SEEDS, SPECIAL_SEEDS } from '../../data/plants'
import { OUTDOOR, OUTDOOR_SPECIAL } from '../../data/outdoor'
import { INDOOR, STYLES } from '../../data/indoor'
import { describeUnlock } from '../../data/unlocks'
import type { CatalogItem } from '../../data/types'
import { buyItem, progressStats } from '../../db/garden'
import { ruleProgress, type ProgressStats } from '../../engine/unlocks'
import { itemUnlocked } from '../../engine/progress'
import { canWish } from '../../engine/wish'
import { clearWish, setWish } from '../../db/progress'
import { Celebrate } from '../../ui/Celebrate'
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

/** 这一版还不能使用的物品，以及原因 */
function notYet(item: CatalogItem): string | null {
  if (item.plant?.needs === 'pond') return '池塘种植稍后开放'
  return null
}

const isStyle = (item: CatalogItem) => item.kind === 'wallStyle' || item.kind === 'floorStyle'

export function Shop() {
  const { child, balance, inventory, unlocks, wish } = useStore()
  const [celebrate, setCelebrate] = useState(0)
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
          const locked = !itemUnlocked(item, stats, unlocks)
          const later = notYet(item)
          const short = item.price - balance.coin
          const owned = isStyle(item) && inventory.some((i) => i.catalogId === item.id)
          const gift = item.price <= 0
          const wished = wish?.catalogId === item.id
          return (
            <div key={item.id} className={`shop-card${locked ? ' locked' : ''}${wished ? ' wished' : ''}`}>
              {!locked && !owned && !later && canWish(item) && (
                <button
                  className={`wish-btn${wished ? ' on' : ''}`}
                  aria-label={wished ? '取消心愿' : '设为心愿'}
                  onClick={async () => {
                    await act(async () => {
                      if (wished) await clearWish(child.id)
                      else await setWish(child.id, item.id)
                    })
                    if (!wished) toast(`${item.name}是你的心愿啦，首页能看到进度`)
                  }}
                >
                  {wished ? '💗' : '🤍'}
                </button>
              )}
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
              ) : gift ? (
                <div className="shop-note">✓ 解锁时已送给你，在装扮里摆放</div>
              ) : owned ? (
                <div className="shop-note">✓ 已拥有，在装扮里更换</div>
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
      {celebrate > 0 && <Celebrate key={celebrate} />}
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
            if (r.ok && r.wishDone) {
              setCelebrate((n) => n + 1)
              toast(`心愿实现啦！${buying.name}放进背包了，再挑一个新心愿吧`)
            } else if (r.ok) toast(isStyle(buying) ? `买到${buying.name}啦，在小屋装扮里换上吧` : `${buying.name}${buying.plant ? '种子' : ''}放进背包啦`)
          }}
        />
      )}
    </div>
  )
}
