import { useStore } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { wishProgress } from '../../engine/wish'
import { Icon } from '../../ui/Icon'

/** 首页心愿进度条：已攒 120 / 300 金币；够了就发光 */
export function WishBar() {
  const { wish, balance, go } = useStore()
  const item = wish ? getCatalogItem(wish.catalogId) : undefined
  if (!item) return null
  const p = wishProgress(item.price, balance.coin)
  return (
    <button className={`wish-bar${p.ready ? ' ready' : ''}`} onClick={() => go('shop')} aria-label={`心愿：${item.name}`}>
      <span className="wish-icon"><Icon icon={item.icon} size={38} /></span>
      <span className="wish-main">
        <span className="wish-title">💗 心愿：{item.name}</span>
        <span className="wish-track"><span className="wish-fill" style={{ width: `${p.ratio * 100}%` }} /></span>
        <span className="wish-text">{p.ready ? '金币够啦！去商店买吧' : <>已攒 <span className="num">{p.saved}</span> / <span className="num">{p.price}</span> 金币</>}</span>
      </span>
    </button>
  )
}
