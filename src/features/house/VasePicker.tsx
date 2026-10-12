import { useStore, act } from '../../app/store'
import { harvestInfo } from '../../data/plants'
import { putInVase } from '../../db/decorate'
import { Modal } from '../../ui/Modal'
import { Icon } from '../../ui/Icon'
import { Mascot } from '../../ui/Mascot'

/** 点花瓶：从背包里选一朵收获的鲜花插进去 */
export function VasePicker({ vaseId, onClose }: { vaseId: string; onClose: () => void }) {
  const inventory = useStore((s) => s.inventory)
  const flowers = inventory.filter((i) => i.count > 0 && harvestInfo(i.catalogId)?.kind === 'flower')
  return (
    <Modal onClose={onClose}>
      <h2 className="modal-title">插一朵花吧</h2>
      {flowers.length === 0 ? (
        <>
          <Mascot size={88} bounce />
          <p className="modal-text">还没有收获的鲜花。去花园种花，开花后点它收获，就能插在这里</p>
          <button className="btn btn-primary" onClick={onClose}>好的</button>
        </>
      ) : (
        <div className="seed-grid">
          {flowers.map((f) => {
            const info = harvestInfo(f.catalogId)!
            return (
              <button
                key={f.id}
                className="seed-btn"
                onClick={async () => {
                  await act(() => putInVase(vaseId, f.catalogId))
                  onClose()
                }}
              >
                <Icon icon={info.icon} size={52} />
                <span className="title">{info.name}</span>
                <span className="seed-count">× {f.count}</span>
              </button>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
