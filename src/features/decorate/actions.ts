import { act, useStore } from '../../app/store'
import { moveTo, placeFromInventory } from '../../db/decorate'
import { toast } from '../../ui/Toast'
import { useDecorate, type Cell, type Holding } from './useDecorate'

/** 把手里的东西放到某个格子上 */
export async function dropAt(cell: Cell, h: Holding) {
  const child = useStore.getState().child
  if (!child) return
  const ok = await act(() =>
    h.kind === 'new' ? placeFromInventory(child.id, h.catalogId, cell.x, cell.y) : moveTo(child.id, h.id, cell.x, cell.y),
  )
  const d = useDecorate.getState()
  if (ok) {
    d.hold(null)
  } else {
    toast('这里放不下哦，换个绿色的位置试试')
  }
}
