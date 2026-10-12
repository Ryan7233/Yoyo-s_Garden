import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { flip, storeBack } from '../../db/decorate'
import { useDecorate } from './useDecorate'
import { Icon } from '../../ui/Icon'
import { toast } from '../../ui/Toast'

/** 点已摆放物品后，工具盒上方的菜单：移动、左右翻转、收回背包（长名字自动省略，不挤掉按钮） */
export function ItemMenu() {
  const { placed, plants } = useStore()
  const { menuId, openMenu, hold } = useDecorate()
  if (!menuId) return null
  const p = placed.find((q) => q.id === menuId)
  const plant = p ? undefined : plants.find((q) => q.id === menuId)
  const catalogId = p?.catalogId ?? plant?.catalogId
  const item = catalogId ? getCatalogItem(catalogId) : undefined
  if (!item || !catalogId) return null

  return (
    <div className="item-menu">
      <span className="item-menu-icon"><Icon icon={item.icon} size={40} /></span>
      <span className="title item-menu-name">{item.name}</span>
      <button className="btn" onClick={() => hold({ kind: 'move', id: menuId, catalogId })}>✋ 移动</button>
      {p && (
        <>
          <button className="btn" onClick={() => act(() => flip(p.id))}>↔️ 翻转</button>
          <button
            className="btn"
            onClick={async () => {
              const r = await act(() => storeBack(p.id))
              if (!r.ok && r.reason === 'pondPlanted') toast('池塘里种着植物，不能收回哦')
              openMenu(null)
            }}
          >
            🎒 收回背包
          </button>
        </>
      )}
      <button className="btn btn-primary" onClick={() => openMenu(null)}>好了</button>
    </div>
  )
}
