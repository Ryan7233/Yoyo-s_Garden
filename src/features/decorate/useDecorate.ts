import { create } from 'zustand'
import type { Layer, Scene } from '../../engine/placement'

/** 手里拿着的东西：背包里的新物品，或者正在移动的已摆放物品/盆栽 */
export type Holding =
  | { kind: 'new'; catalogId: string }
  | { kind: 'move'; id: string; catalogId: string }

export interface Cell { scene: Scene; layer: Layer; x: number; y: number }

interface DecorateState {
  holding: Holding | null
  hover: Cell | null
  dragging: boolean
  /** 点开浮动菜单的物品 id */
  menuId: string | null
  hold: (h: Holding | null) => void
  setHover: (c: Cell | null) => void
  setDragging: (d: boolean) => void
  openMenu: (id: string | null) => void
  reset: () => void
}

export const useDecorate = create<DecorateState>((set) => ({
  holding: null,
  hover: null,
  dragging: false,
  menuId: null,
  hold: (holding) => set({ holding, menuId: null }),
  setHover: (hover) => set({ hover }),
  setDragging: (dragging) => set({ dragging }),
  openMenu: (menuId) => set({ menuId, holding: null }),
  reset: () => set({ holding: null, hover: null, dragging: false, menuId: null }),
}))

/** 找到手指下面的格子（格子按钮带 data-cell 属性） */
export function cellAt(clientX: number, clientY: number): Cell | null {
  for (const el of document.elementsFromPoint(clientX, clientY)) {
    const d = (el as HTMLElement).dataset
    if (d?.cell) {
      return { scene: d.scene as Scene, layer: d.layer as Layer, x: Number(d.x), y: Number(d.y) }
    }
  }
  return null
}
