import { useEffect, useState } from 'react'
import './pinpad.css'

/** 4 位数字键盘 */
export function PinPad({ onComplete, disabled, shakeKey }: { onComplete: (pin: string) => void; disabled?: boolean; shakeKey?: number }) {
  const [pin, setPin] = useState('')
  useEffect(() => setPin(''), [shakeKey])
  const press = (d: string) => {
    if (disabled) return
    const next = (pin + d).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => onComplete(next), 120)
    }
  }
  return (
    <div className={`pinpad${shakeKey ? ' shake' : ''}`} key={shakeKey}>
      <div className="pin-dots">
        {[0, 1, 2, 3].map((i) => <span key={i} className={`pin-dot${i < pin.length ? ' on' : ''}`} />)}
      </div>
      <div className="pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="btn btn-ghost pin-key" onClick={() => press(d)} disabled={disabled}>{d}</button>
        ))}
        <span />
        <button className="btn btn-ghost pin-key" onClick={() => press('0')} disabled={disabled}>0</button>
        <button className="btn btn-ghost pin-key" onClick={() => setPin(pin.slice(0, -1))} disabled={disabled} aria-label="删除">⌫</button>
      </div>
    </div>
  )
}
