import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { ParentGate } from './ParentGate'
import { PendingPanel } from './PendingPanel'
import { RecordsPanel } from './RecordsPanel'
import { BonusPanel } from './BonusPanel'
import { TaskConfigPanel } from './TaskConfigPanel'
import { ExerciseConfigPanel } from './ExerciseConfigPanel'
import { DataPanel } from './DataPanel'
import { SettingsPanel } from './SettingsPanel'
import { diffDays, toTaskDay } from '../../engine/taskDay'
import './parent.css'

type Tab = 'pending' | 'records' | 'bonus' | 'tasks' | 'exercise' | 'data' | 'settings'
const TABS: { id: Tab; label: string }[] = [
  { id: 'pending', label: '待确认' },
  { id: 'records', label: '今日记录' },
  { id: 'bonus', label: '加分' },
  { id: 'tasks', label: '任务配置' },
  { id: 'exercise', label: '运动目标' },
  { id: 'data', label: '数据' },
  { id: 'settings', label: '设置' },
]

export function ParentMode({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab] = useState<Tab>('pending')
  const pendingCount = useStore(
    (s) => s.records.filter((r) => r.status === 'pending').length + s.exerciseRecords.filter((r) => r.status === 'pending').length,
  )
  const settings = useStore((s) => s.settings)
  const child = useStore((s) => s.child)
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 2 分钟无操作自动退出
  useEffect(() => {
    if (!unlocked) return
    const reset = () => {
      clearTimeout(idle.current)
      idle.current = setTimeout(onClose, BALANCE.parentIdleMs)
    }
    reset()
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    return () => {
      clearTimeout(idle.current)
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [unlocked, onClose])

  const today = toTaskDay(new Date())
  // 每 7 天提醒一次导出备份（从上次备份或首次启动算起）
  const since = settings?.lastBackupAt ?? child?.createdAt
  const backupDue = !!since && diffDays(today, toTaskDay(new Date(since))) >= BALANCE.backupRemindDays

  return (
    <div className="parent-backdrop">
      <section className="parent card pop">
        {!unlocked ? (
          <ParentGate onPass={() => setUnlocked(true)} onCancel={onClose} />
        ) : (
          <>
            <header className="parent-head">
              <h2 style={{ fontSize: 30 }}>⚙️ 家长模式</h2>
              <button className="btn btn-ghost" onClick={onClose}>退出</button>
            </header>
            {backupDue && (
              <div className="parent-alert" onClick={() => setTab('data')}>
                💾 已经 {BALANCE.backupRemindDays} 天以上没有备份了，点这里导出一份吧
              </div>
            )}
            {settings?.clockWentBack && (
              <div className="parent-alert">⏱️ 检测到 iPad 系统时间曾被往回调过，请留意记录是否正常</div>
            )}
            <nav className="parent-tabs">
              {TABS.map((t) => (
                <button key={t.id} className={`parent-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}
                  {t.id === 'pending' && pendingCount > 0 && <span className="count">{pendingCount}</span>}
                </button>
              ))}
            </nav>
            <div className="parent-body">
              {tab === 'pending' && <PendingPanel />}
              {tab === 'records' && <RecordsPanel />}
              {tab === 'bonus' && <BonusPanel />}
              {tab === 'tasks' && <TaskConfigPanel />}
              {tab === 'exercise' && <ExerciseConfigPanel />}
              {tab === 'data' && <DataPanel />}
              {tab === 'settings' && <SettingsPanel />}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
