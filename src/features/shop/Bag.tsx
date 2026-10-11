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
import './shop.css'

export function Bag() {
  const { child, inventory } = useStore()
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

  const section = (title: string, list: typeof owned, render: (i: (typeof owned)[number]) => ReactNode) =>
    list.length > 0 && (
      <>
        <h3 className="bag-section">{title}</h3>
        <div className="shop-grid">{list.map(render)}</div>
      </>
    )

  return (
    <div>
      <h2 className="sheet-title">🎒 背包</h2>
      {owned.length === 0 && (
        <div style={{ textAlign: 'center' }}>
          <Mascot size={96} bounce />
          <p style={{ color: 'var(--text-soft)' }}>背包空空的，去商店看看吧</p>
        </div>
      )}
      {section('种子', seeds, (i) => {
        const item = getCatalogItem(i.catalogId)!
        return (
          <div key={i.id} className="shop-card">
            <div className="shop-icon"><Icon icon={item.icon} size={56} /></div>
            <div className="title shop-name">{item.name}种子</div>
            <div className="shop-note">× {i.count}</div>
          </div>
        )
      })}
      {section('收获', harvests, (i) => {
        const info = harvestInfo(i.catalogId)!
        return (
          <div key={i.id} className="shop-card">
            <div className="shop-icon"><Icon icon={info.icon} size={56} /></div>
            <div className="title shop-name">{info.name}</div>
            <div className="shop-note">× {i.count}</div>
            {info.kind === 'fruit' ? (
              <button className="btn" onClick={() => setSelling(i.catalogId)}>卖 🪙{info.sellPrice}</button>
            ) : (
              <div className="shop-note">以后可以插进小屋的花瓶</div>
            )}
          </div>
        )
      })}
      {section('物品', things, (i) => {
        const item = getCatalogItem(i.catalogId)!
        return (
          <div key={i.id} className="shop-card">
            <div className="shop-icon"><Icon icon={item.icon} size={56} /></div>
            <div className="title shop-name">{item.name}</div>
            <div className="shop-note">× {i.count}</div>
            {!item.starter && item.price > 0 && (
              <button className="btn" onClick={() => setSellingItem(i.catalogId)}>卖 🪙{sellPriceOf(item)}</button>
            )}
          </div>
        )
      })}
      {things.length > 0 && <p className="shop-note" style={{ marginTop: 12 }}>点下面的“装扮”就能把东西摆出来</p>}
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
