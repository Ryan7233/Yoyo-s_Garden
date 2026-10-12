import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { STYLES } from '../../data/indoor'
import { applyStyle } from '../../db/decorate'
import { slotFor } from '../../engine/placement'
import { Icon } from '../../ui/Icon'
import { startPress } from './drag'
import { dropAt } from './actions'
import { useDecorate } from './useDecorate'
import { ItemMenu } from './ItemMenu'
import './decorate.css'

/**
 * 装扮模式的底部工具盒：上面是步骤和按钮，下面是可以左右滑动的物品格。
 * 点了场景里的物品时，工具盒上方换成这件物品的菜单（不盖住场景）。
 */
export function DecorateTray() {
  const { child, inventory, scene, setDecorating, setScene } = useStore()
  const { holding, hold, reset, menuId } = useDecorate()
  if (!child) return null
  const target = scene === 'garden' ? 'outdoor' : 'indoor'
  const items = inventory
    .map((i) => ({ inv: i, item: getCatalogItem(i.catalogId) }))
    .filter(({ inv, item }) => inv.count > 0 && item && slotFor(item)?.scene === target)
  const ownedStyles = STYLES.filter((s) => s.starter || inventory.some((i) => i.catalogId === s.id))
  const held = holding ? getCatalogItem(holding.catalogId) : undefined
  const step = holding ? 2 : 1

  const done = () => {
    reset()
    setDecorating(false)
  }

  return (
    <div className="tray">
      {menuId ? (
        <ItemMenu />
      ) : (
        <div className="tray-head">
          <span className="title tray-title">🎨 装扮{scene === 'garden' ? '花园' : '小屋'}</span>
          <ol className="tray-steps" aria-label="装扮步骤">
            <li className={step === 1 ? 'on' : 'past'}>拿起物品</li>
            <li className={step === 2 ? 'on' : ''}>
              {held ? <>把<b>{held.name}</b>放到绿色格子上</> : '选择位置'}
            </li>
            <li>完成装扮</li>
          </ol>
          {holding && (
            <button className="btn btn-ghost" onClick={() => hold(null)}>放下</button>
          )}
          <button className="btn" onClick={() => { reset(); setScene(scene === 'garden' ? 'house' : 'garden') }}>
            {scene === 'garden' ? '🏠 去小屋' : '🌳 去花园'}
          </button>
          <button className="btn btn-primary" onClick={done}>完成装扮</button>
        </div>
      )}
      <div className="tray-items">
        {items.length === 0 && <span className="tray-empty">背包里没有能摆在{scene === 'garden' ? '花园' : '小屋'}的东西，去商店挑一件吧</span>}
        {items.map(({ inv, item }) => {
          const active = holding?.kind === 'new' && holding.catalogId === inv.catalogId
          return (
            <button
              key={inv.id}
              className={`tray-item${active ? ' active' : ''}`}
              aria-pressed={active}
              onPointerDown={(e) =>
                startPress(e, { kind: 'new', catalogId: inv.catalogId }, dropAt, () => hold(active ? null : { kind: 'new', catalogId: inv.catalogId }))
              }
            >
              <span className="tray-icon"><Icon icon={item!.icon} size={48} /></span>
              <span className="tray-name">{item!.name}</span>
              {inv.count > 1 && <span className="tray-count num">×{inv.count}</span>}
            </button>
          )
        })}
        {scene === 'house' && (
          <>
            <span className="tray-sep" aria-hidden />
            {ownedStyles.map((s) => {
              const on = child.wallStyle === s.id || child.floorStyle === s.id
              return (
                <button key={s.id} className={`tray-item style${on ? ' active' : ''}`} aria-pressed={on} onClick={() => act(() => applyStyle(child.id, s.id))}>
                  <span className="tray-icon"><Icon icon={s.icon} size={48} /></span>
                  <span className="tray-name">{s.name}</span>
                  {on && <span className="tray-check">✓</span>}
                </button>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
