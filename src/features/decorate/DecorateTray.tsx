import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { STYLES } from '../../data/indoor'
import { applyStyle } from '../../db/decorate'
import { slotFor } from '../../engine/placement'
import { Icon } from '../../ui/Icon'
import { startPress } from './drag'
import { dropAt } from './actions'
import { useDecorate } from './useDecorate'
import './decorate.css'

/** 装扮模式的底部栏：背包里能摆在当前场景的物品；小屋里还能换墙纸地板 */
export function DecorateTray() {
  const { child, inventory, scene, setDecorating, setScene } = useStore()
  const { holding, hold, reset } = useDecorate()
  if (!child) return null
  const target = scene === 'garden' ? 'outdoor' : 'indoor'
  const items = inventory
    .map((i) => ({ inv: i, item: getCatalogItem(i.catalogId) }))
    .filter(({ inv, item }) => inv.count > 0 && item && slotFor(item)?.scene === target)
  const ownedStyles = STYLES.filter((s) => s.starter || inventory.some((i) => i.catalogId === s.id))

  const done = () => {
    reset()
    setDecorating(false)
  }

  return (
    <div className="tray">
      <div className="tray-head">
        <span className="title tray-title">🎨 装扮{scene === 'garden' ? '花园' : '小屋'}</span>
        <span className="tray-tip">
          {holding ? '点一个绿色的格子放下，或者直接拖过去' : '点背包里的东西再点格子，或者直接拖到场景里；点已摆好的东西可以移动'}
        </span>
        <button className="btn" onClick={() => { reset(); setScene(scene === 'garden' ? 'house' : 'garden') }}>
          {scene === 'garden' ? '🏠 去小屋' : '🌳 去花园'}
        </button>
        <button className="btn btn-primary" onClick={done}>完成</button>
      </div>
      <div className="tray-items">
        {items.length === 0 && <span className="tray-empty">背包里没有能摆在这里的东西，去商店看看吧</span>}
        {items.map(({ inv, item }) => {
          const active = holding?.kind === 'new' && holding.catalogId === inv.catalogId
          return (
            <button
              key={inv.id}
              className={`tray-item${active ? ' active' : ''}`}
              onPointerDown={(e) =>
                startPress(e, { kind: 'new', catalogId: inv.catalogId }, dropAt, () => hold(active ? null : { kind: 'new', catalogId: inv.catalogId }))
              }
            >
              <Icon icon={item!.icon} size={44} />
              <span className="tray-name">{item!.name}</span>
              {inv.count > 1 && <span className="tray-count">×{inv.count}</span>}
            </button>
          )
        })}
        {scene === 'house' && (
          <>
            <span className="tray-sep" />
            {ownedStyles.map((s) => {
              const on = child.wallStyle === s.id || child.floorStyle === s.id
              return (
                <button key={s.id} className={`tray-item${on ? ' active' : ''}`} onClick={() => act(() => applyStyle(child.id, s.id))}>
                  <Icon icon={s.icon} size={44} />
                  <span className="tray-name">{s.name}</span>
                </button>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
