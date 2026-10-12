import { useState } from 'react'
import { useStore } from '../../app/store'
import { PinPad } from '../../ui/PinPad'
import { BALANCE } from '../../data/balance'
import { afterFail, isLocked, verifyPin, type PinLock } from '../../engine/pin'
import { readLock, writeLock } from './pinLock'
import './parent.css'

/** 家长当场见证：点“我看到了”并输入 PIN（与家长模式共用输错锁定） */
export function WitnessPin({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const settings = useStore((s) => s.settings)
  const [lock, setLock] = useState<PinLock>(readLock)
  const [shake, setShake] = useState(0)
  const [now, setNow] = useState(Date.now())
  if (!settings) return null
  const locked = isLocked(lock, now)
  if (locked) setTimeout(() => setNow(Date.now()), 1000)

  const tryPin = async (pin: string) => {
    if (await verifyPin(pin, settings.pinSalt, settings.pinHash)) {
      const l = { fails: 0, lockedUntil: 0 }
      writeLock(l)
      onPass()
    } else {
      const l = afterFail(lock, Date.now(), BALANCE.pinMaxTries, BALANCE.pinLockMs)
      writeLock(l)
      setLock(l)
      setNow(Date.now())
      setShake((n) => n + 1)
    }
  }

  return (
    <div className="parent-gate">
      <h2 className="modal-title">👀 我看到了</h2>
      {locked ? (
        <p>输错太多次啦，请 {Math.ceil((lock.lockedUntil - now) / 1000)} 秒后再试</p>
      ) : (
        <p className="modal-text">{lock.fails > 0 ? `密码不对，还可以试 ${BALANCE.pinMaxTries - lock.fails} 次` : '请爸爸妈妈输入密码确认'}</p>
      )}
      <PinPad onComplete={tryPin} disabled={locked} shakeKey={shake} />
      <button className="btn btn-ghost" onClick={onCancel}>返回</button>
    </div>
  )
}
