import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { PinPad } from '../../ui/PinPad'
import { BALANCE } from '../../data/balance'
import { afterFail, isLocked, isValidPin, makeResetQuestion, verifyPin, type PinLock } from '../../engine/pin'
import { changePin } from '../../db/actions'
import { readLock, writeLock } from './pinLock'

export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const settings = useStore((s) => s.settings)
  const [lock, setLock] = useState<PinLock>(readLock)
  const [shake, setShake] = useState(0)
  const [mode, setMode] = useState<'pin' | 'forgot' | 'newpin'>('pin')
  const [q] = useState(() => makeResetQuestion())
  const [answer, setAnswer] = useState('')
  const [now, setNow] = useState(Date.now())
  if (!settings) return null

  const locked = isLocked(lock, now)
  if (locked) setTimeout(() => setNow(Date.now()), 1000)

  const tryPin = async (pin: string) => {
    if (await verifyPin(pin, settings.pinSalt, settings.pinHash)) {
      const l = { fails: 0, lockedUntil: 0 }
      writeLock(l)
      setLock(l)
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
      {mode === 'pin' && (
        <>
          <h2 style={{ fontSize: 30 }}>家长模式</h2>
          {locked ? (
            <p>输错太多次啦，请 {Math.ceil((lock.lockedUntil - now) / 1000)} 秒后再试</p>
          ) : (
            <p style={{ color: 'var(--text-soft)' }}>{lock.fails > 0 ? `密码不对，还可以试 ${BALANCE.pinMaxTries - lock.fails} 次` : '请输入 4 位密码'}</p>
          )}
          <PinPad onComplete={tryPin} disabled={locked} shakeKey={shake} />
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onCancel}>返回</button>
            <button className="btn btn-ghost" onClick={() => setMode('forgot')}>忘记密码</button>
          </div>
        </>
      )}
      {mode === 'forgot' && (
        <>
          <h2 style={{ fontSize: 30 }}>回答问题重设密码</h2>
          <p className="title" style={{ fontSize: 40 }}>{q.a} × {q.b} = ?</p>
          <input className="input" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))} style={{ maxWidth: 240, textAlign: 'center' }} />
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setMode('pin')}>返回</button>
            <button className="btn btn-primary" disabled={!answer} onClick={() => (Number(answer) === q.answer ? setMode('newpin') : setAnswer(''))}>确定</button>
          </div>
        </>
      )}
      {mode === 'newpin' && (
        <>
          <h2 style={{ fontSize: 30 }}>设置新密码</h2>
          <PinPad
            onComplete={async (p) => {
              if (!isValidPin(p)) return
              await act(() => changePin(p))
              onPass()
            }}
          />
        </>
      )}
    </div>
  )
}
