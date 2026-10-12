import { useState, type CSSProperties } from 'react'
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
import { CoinFly } from '../ui/CoinFly'
import { DecorateTray } from '../features/decorate/DecorateTray'
import { useDecorate } from '../features/decorate/useDecorate'
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
]

export function Layout() {
  const { child, balance, page, go, scene, setScene, decorating, setDecorating, parentOpen, setParentOpen } = useStore()
  const [palette, setPalette] = useState(false)
  if (!child) return null
  const sheet = page

  return (
    <div className="layout">
      {!isStandalone() && (
        <div className="standalone-tip">请从主屏幕上的“小花园”图标打开，这样每次用的都是同一份花园记录</div>
      )}
      <header className="topbar">
        <div className="topbar-left">
          {scene === 'house' && (
            <button className="btn btn-ghost icon-btn" onClick={() => { useDecorate.getState().reset(); setScene('garden') }} aria-label="回到花园">←</button>
          )}
          <h1 className="garden-name"><span>{scene === 'house' ? `${child.name}的小屋` : child.gardenName}</span></h1>
        </div>
        <BalanceBar balance={balance} />
        <div className="topbar-right">
          <button className="btn btn-ghost icon-btn" onClick={() => setPalette(true)} aria-label="换颜色">🖍️</button>
          <button className="btn btn-ghost icon-btn" onClick={() => setParentOpen(true)} aria-label="家长模式">⚙️</button>
        </div>
      </header>

      <main className={`scene-wrap scene-${scene}${decorating ? ' decorating' : ''}`}>
        {scene === 'garden' ? <GardenScene onEnterHouse={() => { useDecorate.getState().reset(); setScene('house') }} /> : <HouseScene />}
      </main>

      {decorating ? (
        <DecorateTray />
      ) : (
        <nav className="bottom-nav">
          {NAV.map((n) => (
            <button
              key={n.page}
              className={`nav-btn${page === n.page ? ' active' : ''}`}
              onClick={() => go(page === n.page ? null : n.page)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
          <button className="nav-btn" onClick={() => setDecorating(true)}>
            <span className="nav-icon">🎨</span>
            <span className="nav-label">装扮</span>
          </button>
        </nav>
      )}

      {sheet && (
        <div className="sheet-backdrop" onClick={() => go(null)}>
          <section className="sheet card pop" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-ghost icon-btn sheet-close" onClick={() => go(null)} aria-label="关闭">✕</button>
            {sheet === 'tasks' && <TodayTasks />}
            {sheet === 'bag' && <Bag />}
            {sheet === 'shop' && <Shop />}
            {sheet === 'codex' && <Codex />}
          </section>
        </div>
      )}

      {palette && (
        <Modal onClose={() => setPalette(false)}>
          <h2 className="modal-title">换一个颜色</h2>
          <div className="theme-row">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`btn theme-btn${child.theme === t.id ? ' on' : ''}`}
                style={{ '--swatch': t.color } as CSSProperties}
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

      {!parentOpen && <RewardNotices showUnlocks={!decorating} />}
      <CoinFly />
      <ToastHost />
      {parentOpen && <ParentMode onClose={() => setParentOpen(false)} />}
    </div>
  )
}
