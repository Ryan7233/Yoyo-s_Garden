import { useStore } from '../../app/store'
import { SEEDS, SPECIAL_SEEDS } from '../../data/plants'
import { Icon } from '../../ui/Icon'
import '../shop/shop.css'
import './codex.css'

/** 图鉴：种出过的植物显示彩色，没种过的显示剪影（访客和徽章在 M5） */
export function Codex() {
  const unlocks = useStore((s) => s.unlocks)
  const seen = new Set(unlocks.filter((u) => u.kind === 'codex').map((u) => u.refId))
  const all = [...SEEDS, ...SPECIAL_SEEDS]
  return (
    <div>
      <h2 className="sheet-title">📖 图鉴</h2>
      <p className="codex-count title">植物 {all.filter((p) => seen.has(p.id)).length} / {all.length}</p>
      <div className="codex-grid">
        {all.map((p) => {
          const on = seen.has(p.id)
          return (
            <div key={p.id} className={`codex-card${on ? '' : ' unknown'}`}>
              <Icon icon={p.icon} size={56} />
              <span className="title">{on ? p.name : '？？？'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
