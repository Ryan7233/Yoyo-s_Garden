import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { plantableOutdoors } from '../../data/plants'
import { plantSeed } from '../../db/garden'
import { Modal } from '../../ui/Modal'
import { Icon } from '../../ui/Icon'
import { Mascot } from '../../ui/Mascot'

export function SeedPicker({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const { child, inventory, go } = useStore()
  if (!child) return null
  const seeds = inventory
    .map((i) => ({ inv: i, item: getCatalogItem(i.catalogId) }))
    .filter((s) => s.item && s.inv.count > 0 && plantableOutdoors(s.item))

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 30, marginBottom: 16 }}>种点什么呢？</h2>
      {seeds.length === 0 ? (
        <>
          <Mascot size={88} bounce />
          <p style={{ color: 'var(--text-soft)' }}>背包里没有种子啦，去商店看看吧</p>
          <button className="btn btn-primary btn-big" onClick={() => { onClose(); go('shop') }}>去商店 🛍️</button>
        </>
      ) : (
        <div className="seed-grid">
          {seeds.map(({ inv, item }) => (
            <button
              key={inv.id}
              className="seed-btn"
              onClick={async () => {
                await act(() => plantSeed(child.id, inv.catalogId, x, y))
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
