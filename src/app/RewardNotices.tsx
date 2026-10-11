import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store'
import { Modal } from '../ui/Modal'
import { Mascot } from '../ui/Mascot'
import { Celebrate } from '../ui/Celebrate'
import type { LedgerEntry } from '../data/types'

const SEEN_KEY = 'little-garden:seen-ledger-at'

function readSeen(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}
function writeSeen(at: string) {
  try {
    localStorage.setItem(SEEN_KEY, at)
  } catch {
    /* 无痕模式等情况下忽略 */
  }
}

/**
 * 孩子下次打开时看到家长确认后的到账和加分小纸条。
 * 只提示家长操作产生的收入；孩子自己操作的到账当场已经有动画。
 */
export function RewardNotices() {
  const ledger = useStore((s) => s.ledger)
  const records = useStore((s) => s.records)
  const [seen, setSeen] = useState<string | null>(() => readSeen())

  useEffect(() => {
    // 第一次运行：从现在开始计
    if (seen === null && ledger.length) {
      const last = ledger[ledger.length - 1].at
      writeSeen(last)
      setSeen(last)
    }
  }, [seen, ledger])

  const fresh = useMemo(() => {
    if (!seen) return []
    const parentRecordIds = new Set(records.filter((r) => r.source === 'parent' || r.confirmedAt !== r.createdAt).map((r) => r.id))
    return ledger.filter(
      (e) =>
        e.at > seen &&
        e.amount > 0 &&
        (e.reason === 'bonus' || e.reason === 'allDone' || e.reason === 'streak' || (e.reason === 'task' && parentRecordIds.has(e.refId ?? ''))),
    )
  }, [ledger, records, seen])

  if (!fresh.length) return null

  const bonuses = fresh.filter((e) => e.reason === 'bonus')
  const others = fresh.filter((e) => e.reason !== 'bonus')
  const sum = (list: LedgerEntry[], c: 'coin' | 'drop') => list.filter((e) => e.currency === c).reduce((s, e) => s + e.amount, 0)
  const taskCount = new Set(others.filter((e) => e.reason === 'task').map((e) => e.refId)).size

  const close = () => {
    const last = ledger[ledger.length - 1].at
    writeSeen(last)
    setSeen(last)
  }

  return (
    <>
      <Celebrate />
      <Modal onClose={close}>
        <Mascot size={96} bounce />
        {bonuses.map((b) => (
          <div key={b.id} className="card pop" style={{ background: '#fffbef', borderColor: 'var(--coin)', margin: '12px 0', fontSize: 24 }}>
            📝 因为你{b.note}，获得 {b.amount} 金币
          </div>
        ))}
        {others.length > 0 && (
          <p className="title" style={{ fontSize: 26, margin: '12px 0' }}>
            {taskCount > 0 ? `爸爸妈妈确认了 ${taskCount} 项任务，` : ''}
            获得 🪙 {sum(others, 'coin')}
            {sum(others, 'drop') > 0 ? ` 💧 ${sum(others, 'drop')}` : ''}
          </p>
        )}
        <button className="btn btn-primary btn-big" onClick={close}>收下啦</button>
      </Modal>
    </>
  )
}
