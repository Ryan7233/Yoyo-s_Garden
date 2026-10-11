import { useState } from 'react'
import { useStore, act, type Page } from './store'
import { BalanceBar } from '../ui/BalanceBar'
import { GardenScene } from '../features/garden/GardenScene'
import { HouseScene } from '../features/house/HouseScene'
import { TodayTasks } from '../features/tasks/TodayTasks'
import { ParentMode } from '../features/parent/ParentMode'
import { Bag } from '../features/shop/Bag'
import { Shop } from '../features/shop/Shop'
import { Codex } from '../features/codex/Codex'
import { ToastHost } from '../ui/Toast'
import { ComingSoon } from './ComingSoon'
import { RewardNotices } from './RewardNotices'
import { isStandalone } from './standalone'
import { THEMES } from './themes'
import { updateChild } from '../db/actions'
import { Modal } from '../ui/Modal'
import './layout.css'

const NAV: { page: Page; icon: string; label: string }[] = [
  { page: 'tasks', icon: '📋', label: '任务' },
  { page: 'shop', icon: '🛍️', label: '商店' },
  { page: 'bag', icon: '🎒', label: '背包' },
  { page: 'codex', icon: '📖', label: '图鉴' },
  { page: 'decorate', icon: '🎨', label: '装扮' },
]

export function Layout() {
  const { child, balance, page, go, parentOpen, setParentOpen } = useStore()
  const [palette, setPalette] = useState(false)
  if (!child) return null
  const scene = page === 'house' ? 'house' : 'garden'
  const sheet = page !== 'garden' && page !== 'house' ? page : null

  return (
    <div className="layout">
      {!isStandalone() && (
        <div className="standalone-tip">请从主屏幕上的“小花园”图标打开，数据才不会丢哦</div>
      )}
      <header className="topbar">
        <div className="topbar-left">
          {scene === 'house' && (
            <button className="btn btn-ghost icon-btn" onClick={() => go('garden')} aria-label="回到花园">←</button>
          )}
          <h1 className="garden-name">{scene === 'house' ? `${child.name}的小屋` : child.gardenName}</h1>
        </div>
        <BalanceBar balance={balance} />
        <div className="topbar-right">
          <button className="btn btn-ghost icon-btn" onClick={() => setPalette(true)} aria-label="换颜色">🎨</button>
          <button className="btn btn-ghost icon-btn" onClick={() => setParentOpen(true)} aria-label="家长模式">⚙️</button>
        </div>
      </header>

      <main className="scene-wrap">
        {scene === 'garden' ? <GardenScene onEnterHouse={() => go('house')} /> : <HouseScene />}
      </main>

      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button
            key={n.page}
            className={`nav-btn${page === n.page ? ' active' : ''}`}
            onClick={() => go(page === n.page ? scene : n.page)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>

      {sheet && (
        <div className="sheet-backdrop" onClick={() => go(scene)}>
          <section className="sheet card pop" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-ghost icon-btn sheet-close" onClick={() => go(scene)} aria-label="关闭">✕</button>
            {sheet === 'tasks' && <TodayTasks />}
            {sheet === 'bag' && <Bag />}
            {sheet === 'shop' && <Shop />}
            {sheet === 'codex' && <Codex />}
            {sheet === 'decorate' && <ComingSoon title="装扮" text="很快就可以自己摆放花园和小屋啦！" />}
          </section>
        </div>
      )}

      {palette && (
        <Modal onClose={() => setPalette(false)}>
          <h2 style={{ fontSize: 30, marginBottom: 20 }}>换一个颜色</h2>
          <div className="modal-actions">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className="btn"
                style={{ background: t.color, borderColor: child.theme === t.id ? 'var(--text)' : t.color }}
                onClick={async () => {
                  await act(() => updateChild(child.id, { theme: t.id }))
                  setPalette(false)
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {!parentOpen && <RewardNotices />}
      <ToastHost />
      {parentOpen && <ParentMode onClose={() => setParentOpen(false)} />}
    </div>
  )
}
