import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { plantableInOrchard, plantableInPond, plantableOutdoors } from '../../data/plants'
import { plantInPond, plantSeed } from '../../db/garden'
import { Modal } from '../../ui/Modal'
import { Icon } from '../../ui/Icon'
import { Mascot } from '../../ui/Mascot'

/** 选种子种下：泥土菜畦、果园树坑（orchard），或者池塘（pondId） */
export function SeedPicker({ x, y, pondId, orchard, sheet, onClose }: { x: number; y: number; pondId?: string; orchard?: boolean; sheet?: boolean; onClose: () => void }) {
  const { child, inventory, go } = useStore()
  if (!child) return null
  const seeds = inventory
    .map((i) => ({ inv: i, item: getCatalogItem(i.catalogId) }))
    .filter((s) => s.item && s.inv.count > 0 && (pondId ? plantableInPond(s.item) : orchard ? plantableInOrchard(s.item) : plantableOutdoors(s.item)))

  return (
    <Modal onClose={onClose} sheet={sheet}>
      <h2 className="modal-title">{pondId ? '池塘里种点什么呢？' : orchard ? '果园里种哪棵树？' : '种点什么呢？'}</h2>
      {seeds.length === 0 ? (
        <>
          <Mascot size={88} bounce />
          <p className="modal-text">{pondId ? '池塘里能种莲花和水晶莲，背包里还没有，去商店看看吧' : orchard ? '果园里种果树和大树，背包里还没有树苗，去商店看看吧' : '背包里没有种子啦，去商店看看吧'}</p>
          <button className="btn btn-primary btn-big" onClick={() => { onClose(); go('shop') }}>去商店 🛍️</button>
        </>
      ) : (
        <div className="seed-grid">
          {seeds.map(({ inv, item }) => (
            <button
              key={inv.id}
              className="seed-btn"
              onClick={async () => {
                await act(() => (pondId ? plantInPond(child.id, inv.catalogId, pondId) : plantSeed(child.id, inv.catalogId, x, y)))
                onClose()
              }}
            >
              <Icon icon={item!.icon} size={52} />
              <span className="title">{item!.name}</span>
              <span className="seed-count">× {inv.count}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
