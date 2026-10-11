import { useStore } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { Icon } from '../../ui/Icon'

export function Bag() {
  const inventory = useStore((s) => s.inventory).filter((i) => i.count > 0)
  return (
    <div>
      <h2 style={{ fontSize: 34, marginBottom: 20 }}>🎒 背包</h2>
      {inventory.length === 0 && <p style={{ color: 'var(--text-soft)' }}>背包空空的</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {inventory.map((i) => {
          const item = getCatalogItem(i.catalogId)
          if (!item) return null
          return (
            <div key={i.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Icon icon={item.icon} size={56} />
              <span className="title" style={{ fontSize: 22 }}>{item.kind === 'seed' ? `${item.name}种子` : item.name}</span>
              <span style={{ color: 'var(--text-soft)' }}>× {i.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
