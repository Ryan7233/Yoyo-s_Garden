import type { CSSProperties, ReactNode } from 'react'
import { useStore } from '../../app/store'
import type { PlacedItem } from '../../data/types'
import { getCatalogItem } from '../../data/catalog'
import { TILE_IDS } from '../../data/indoor'
import { Icon } from '../../ui/Icon'
import { startPress } from './drag'
import { dropAt } from './actions'
import { useDecorate } from './useDecorate'
import './scene-objects.css'

function cellStyle(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}

/**
 * 场景里的一件物品或一株室内盆栽。占的格子就是它的点击区域（和占格预览一致），
 * 图像按格子大小缩放、落在格子底部，地面物件脚下有接触阴影。
 * 装扮模式下：拖动就是移动，点一下弹出菜单；平时：可选 onTap（比如点花瓶插花）。
 */
export function PlacedView({
  id, catalogId, x, y, flipped, onTap, children, className = 'placed', wall,
}: {
  id: string
  catalogId: string
  x: number
  y: number
  flipped?: boolean
  onTap?: () => void
  children?: ReactNode
  className?: string
  /** 墙面挂件：没有地面阴影 */
  wall?: boolean
}) {
  const decorating = useStore((s) => s.decorating)
  const { holding, menuId } = useDecorate()
  const item = getCatalogItem(catalogId)
  if (!item) return null
  const w = item.plant ? 1 : item.size[0]
  const h = item.plant ? 1 : item.size[1]
  const tile = TILE_IDS.has(item.id)
  const moving = holding?.kind === 'move' && holding.id === id
  const interactive = decorating ? !holding : !!onTap

  return (
    <div
      className={`${className}${tile ? ' tile' : ''}${interactive ? ' tappable' : ''}${menuId === id ? ' selected' : ''}${moving ? ' moving' : ''}`}
      style={{ ...cellStyle(x, y, w, h), '--span-e': Math.min(w, h) + (Math.max(w, h) - Math.min(w, h)) * 0.45, '--row': y } as CSSProperties}
      onPointerDown={
        decorating && !holding
          ? (e) => startPress(e, { kind: 'move', id, catalogId }, dropAt, () => useDecorate.getState().openMenu(id))
          : undefined
      }
      onClick={!decorating && onTap ? onTap : undefined}
      data-item={catalogId}
      aria-label={interactive ? item.name : undefined}
      role={interactive ? 'button' : undefined}
    >
      {!wall && !tile && <span className="contact" aria-hidden />}
      <span className="art" style={{ transform: flipped ? 'scaleX(-1)' : undefined }}>
        {children ?? <Icon icon={item.icon} fluid />}
      </span>
    </div>
  )
}

export function placedProps(p: PlacedItem) {
  return { id: p.id, catalogId: p.catalogId, x: p.x, y: p.y, flipped: p.flipped }
}
