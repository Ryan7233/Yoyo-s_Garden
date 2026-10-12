import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { giveBonus } from '../../db/actions'

export function BonusPanel() {
  const child = useStore((s) => s.child)
  const [reason, setReason] = useState<string>(BALANCE.bonusReasons[0])
  const [custom, setCustom] = useState('')
  const [amount, setAmount] = useState<number>(3)
  const [done, setDone] = useState('')
  if (!child) return null
  const finalReason = (reason === '__custom' ? custom : reason).trim()

  return (
    <div className="panel">
      <h3 className="panel-day">为什么加分？</h3>
      <div className="chips">
        {BALANCE.bonusReasons.map((r) => (
          <button key={r} className={`chip${reason === r ? ' active' : ''}`} onClick={() => setReason(r)}>{r}</button>
        ))}
        <button className={`chip${reason === '__custom' ? ' active' : ''}`} onClick={() => setReason('__custom')}>自定义…</button>
      </div>
      {reason === '__custom' && (
        <input className="input" value={custom} maxLength={20} placeholder="比如：帮奶奶拿东西" onChange={(e) => setCustom(e.target.value)} />
      )}
      <h3 className="panel-day">加多少？</h3>
      <div className="chips">
        {BALANCE.bonusValues.map((v) => (
          <button key={v} className={`chip${amount === v ? ' active' : ''}`} onClick={() => setAmount(v)}>🪙 {v}</button>
        ))}
      </div>
      <p className="modal-text">孩子会看到：“因为你{finalReason || '……'}，获得 {amount} 金币”</p>
      <button
        className="btn btn-primary btn-big"
        disabled={!finalReason}
        onClick={async () => {
          await act(() => giveBonus(child.id, finalReason, amount))
          setDone(`已发放 ${amount} 金币`)
          setTimeout(() => setDone(''), 2000)
        }}
      >
        发放
      </button>
      {done && <p className="pop">✓ {done}</p>}
    </div>
  )
}
