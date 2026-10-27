import { useState, type ReactNode } from 'react'
import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { harvestInfo } from '../../data/plants'
import { sellHarvest } from '../../db/garden'
import { sellItem, sellPriceOf } from '../../db/decorate'
import { Icon } from '../../ui/Icon'
import { ConfirmDialog } from '../../ui/Modal'
import { Mascot } from '../../ui/Mascot'
import { toast } from '../../ui/Toast'
import { Reward } from '../../ui/Reward'
import './shop.css'

export function Bag() {
  const { child, inventory, go, setDecorating } = useStore()
  const [selling, setSelling] = useState<string | null>(null)
  const [sellingItem, setSellingItem] = useState<string | null>(null)
  if (!child) return null
  const owned = inventory.filter((i) => i.count > 0)
  const seeds = owned.filter((i) => getCatalogItem(i.catalogId)?.plant)
  const harvests = owned.filter((i) => harvestInfo(i.catalogId))
  const things = owned.filter((i) => {
    const item = getCatalogItem(i.catalogId)
    return item && !seeds.includes(i) && !harvests.includes(i) && item.kind !== 'wallStyle' && item.kind !== 'floorStyle'
  })
  const sellInfo = selling ? harvestInfo(selling) : undefined

  const section = (title: string, hint: string, list: typeof owned, render: (i: (typeof owned)[number]) => ReactNode, action?: ReactNode) =>
    list.length > 0 && (
      <section className="bag-bin">
        <h3 className="bag-section">{title}<span className="hint">{hint}</span>{action}</h3>
        <div className="shop-grid">{list.map(render)}</div>
      </section>
    )

  const card = (key: string, icon: string, name: string, count: number, foot: ReactNode) => (
    <div key={key} className="shop-card bag-card">
      <span className="bag-count num">×{count}</span>
      <div className="shop-stand small"><span className="shop-icon"><Icon icon={icon} size={64} /></span></div>
      <div className="title shop-name">{name}</div>
      <div className="shop-action">{foot}</div>
    </div>
  )

  return (
    <div>
      <h2 className="sheet-title">🎒 背包</h2>
      {owned.length === 0 && (
        <div className="empty-state">
          <Mascot size={96} bounce />
          <p>背包空空的。完成任务攒金币，去商店挑一包种子吧</p>
          <button className="btn btn-primary btn-big" onClick={() => go('shop')}>去商店 🛍️</button>
        </div>
      )}
      {section('🌱 种子', '点花园里的空地就能种下', seeds, (i) => {
        const item = getCatalogItem(i.catalogId)!
        const pond = item.plant?.needs === 'pond'
        const indoor = item.plant?.needs === 'indoor'
        return card(i.id, item.icon, `${item.name}种子`, i.count, (
          <span className="shop-note">{pond ? '点池塘就能种' : indoor ? '在小屋的装扮里摆到地板上' : '点空地种下'}</span>
        ))
      })}
      {section('🧺 收获', '鲜花可以插进花瓶，果实可以卖掉', harvests, (i) => {
        const info = harvestInfo(i.catalogId)!
        return card(i.id, info.icon, info.name, i.count, info.kind === 'fruit' ? (
          <button className="btn" onClick={() => setSelling(i.catalogId)}>卖 <Reward coins={info.sellPrice} size="s" /></button>
        ) : (
          <span className="shop-note">进小屋点花瓶，就能插上</span>
        ))
      })}
      {/* 背包盖住了底部的“装扮”按钮，所以在这里直接放一个 */}
      {section('🪑 家具和装饰', '点“去装扮”就能摆出来', things, (i) => {
        const item = getCatalogItem(i.catalogId)!
        return card(i.id, item.icon, item.name, i.count, !item.starter && item.price > 0 ? (
          <button className="btn" onClick={() => setSellingItem(i.catalogId)}>卖 <Reward coins={sellPriceOf(item)} size="s" /></button>
        ) : (
          <span className="shop-note">去装扮里摆放</span>
        ))
      }, <button className="btn btn-soft bag-decorate" onClick={() => setDecorating(true)}>🎨 去装扮</button>)}
      {sellingItem && (
        <ConfirmDialog
          title={`把${getCatalogItem(sellingItem)?.name}卖回商店？`}
          message={`只能拿回一半：${sellPriceOf(getCatalogItem(sellingItem)!)} 金币`}
          confirmText="卖掉"
          onCancel={() => setSellingItem(null)}
          onConfirm={async () => {
            const price = sellPriceOf(getCatalogItem(sellingItem)!)
            await act(() => sellItem(child.id, sellingItem))
            setSellingItem(null)
            toast(`+${price} 金币`)
          }}
        />
      )}
      {selling && sellInfo && (
        <ConfirmDialog
          title={`卖掉一个${sellInfo.name}？`}
          message={`可以得到 ${sellInfo.sellPrice} 金币`}
          confirmText="卖掉"
          onCancel={() => setSelling(null)}
          onConfirm={async () => {
            await act(() => sellHarvest(child.id, selling))
            setSelling(null)
            toast(`+${sellInfo.sellPrice} 金币`)
          }}
        />
      )}
    </div>
  )
}
