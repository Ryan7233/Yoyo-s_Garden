import type { ReactNode } from 'react'
import { useStore } from '../../app/store'
import type { PlacedItem } from '../../data/types'
import { getCatalogItem } from '../../data/catalog'
import { Icon } from '../../ui/Icon'
import { startPress } from './drag'
import { dropAt } from './actions'
import { useDecorate } from './useDecorate'

function cellStyle(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}

/**
 * 场景里的一件物品或一株室内盆栽。
 * 装扮模式下：拖动就是移动，点一下弹出浮动菜单；平时：可选 onTap（比如点花瓶插花）。
 */
export function PlacedView({
  id, catalogId, x, y, flipped, size, onTap, children, className = 'placed',
}: {
  id: string
  catalogId: string
  x: number
  y: number
  flipped?: boolean
  size: number
  onTap?: () => void
  children?: ReactNode
  className?: string
}) {
  const decorating = useStore((s) => s.decorating)
  const { holding, menuId } = useDecorate()
  const item = getCatalogItem(catalogId)
  if (!item) return null
  const w = item.plant ? 1 : item.size[0]
  const h = item.plant ? 1 : item.size[1]
  const moving = holding?.kind === 'move' && holding.id === id
  const interactive = decorating ? !holding : !!onTap

  return (
    <div
      className={`${className}${interactive ? ' tappable' : ''}${menuId === id ? ' selected' : ''}${moving ? ' moving' : ''}`}
      style={{ ...cellStyle(x, y, w, h), zIndex: item.id === 'out-path' || item.id === 'in-rug' ? 0 : undefined }}
      onPointerDown={
        decorating && !holding
          ? (e) => startPress(e, { kind: 'move', id, catalogId }, dropAt, () => useDecorate.getState().openMenu(id))
          : undefined
      }
      onClick={!decorating && onTap ? onTap : undefined}
    >
      <span style={{ display: 'inline-flex', transform: flipped ? 'scaleX(-1)' : undefined }}>
        {children ?? <Icon icon={item.icon} size={size * Math.max(w, h)} />}
      </span>
    </div>
  )
}

export function placedProps(p: PlacedItem) {
  return { id: p.id, catalogId: p.catalogId, x: p.x, y: p.y, flipped: p.flipped }
}
