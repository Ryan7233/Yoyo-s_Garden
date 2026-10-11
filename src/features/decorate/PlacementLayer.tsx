import { useStore } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { buildSceneState, canPlace, footprintOf, slotFor, type Layer, type Scene } from '../../engine/placement'
import { Icon } from '../../ui/Icon'
import { useDecorate } from './useDecorate'
import { dropAt } from './actions'

function cellStyle(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}

/**
 * 装扮模式下铺在网格上的一层：透明格子接收点放和拖拽，
 * 手里有东西时显示占格预览（绿色能放，红色不能放）。
 */
export function PlacementLayer({ scene, layer, cols, rows }: { scene: Scene; layer: Layer; cols: number; rows: number }) {
  const { plots, placed, plants } = useStore()
  const { holding, hover, dragging } = useDecorate()

  const item = holding ? getCatalogItem(holding.catalogId) : undefined
  const slot = item ? slotFor(item) : null
  const mine = !!slot && slot.scene === scene && slot.layer === layer
  const state = buildSceneState(scene, plots, placed, plants)
  const ignore = holding?.kind === 'move' ? holding.id : undefined
  const ok = (x: number, y: number) => !!item && canPlace(footprintOf(item, x, y), scene, layer, state, ignore)

  const preview = mine && hover && hover.scene === scene && hover.layer === layer ? hover : null

  return (
    <>
      {mine &&
        Array.from({ length: cols * rows }, (_, i) => {
          const x = i % cols
          const y = Math.floor(i / cols)
          return (
            <button
              key={i}
              className={`place-cell${ok(x, y) ? ' can' : ''}`}
              style={cellStyle(x, y)}
              data-cell="1"
              data-scene={scene}
              data-layer={layer}
              data-x={x}
              data-y={y}
              aria-label={`第 ${y + 1} 行第 ${x + 1} 格`}
              onPointerEnter={() => !dragging && useDecorate.getState().setHover({ scene, layer, x, y })}
              onClick={() => holding && dropAt({ scene, layer, x, y }, holding)}
            />
          )
        })}
      {preview && item && (
        <div
          className={`place-preview ${ok(preview.x, preview.y) ? 'good' : 'bad'}`}
          style={cellStyle(preview.x, preview.y, Math.min(item.size[0], cols - preview.x), Math.min(item.size[1], rows - preview.y))}
        >
          <Icon icon={item.icon} size={44} />
        </div>
      )}
    </>
  )
}
