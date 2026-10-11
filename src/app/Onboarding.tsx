import { useState } from 'react'
import type { ThemeName } from '../data/types'
import { Mascot } from '../ui/Mascot'
import { isValidPin } from '../engine/pin'
import { setupChild } from '../db/actions'
import { act } from './store'
import { THEMES, HOUSE_COLORS } from './themes'
import { PinPad } from '../ui/PinPad'
import { isStandalone } from './standalone'
import './onboarding.css'

type Step = 'name' | 'garden' | 'look' | 'mascot' | 'pin' | 'pin2' | 'home'

export function Onboarding() {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [gardenName, setGardenName] = useState('')
  const [theme, setTheme] = useState<ThemeName>('sakura')
  const [houseColor, setHouseColor] = useState(HOUSE_COLORS[0])
  const [mascotName, setMascotName] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [busy, setBusy] = useState(false)

  const finish = async () => {
    setBusy(true)
    await act(() => setupChild({ name, gardenName, theme, houseColor, mascotName, pin }))
  }

  return (
    <div className="onboarding" data-theme={theme}>
      <div className="onboarding-card card pop" key={step}>
        {step === 'name' && (
          <TextStep
            title="你好呀！你叫什么名字？"
            value={name}
            onChange={setName}
            placeholder="你的名字"
            onNext={() => setStep('garden')}
          />
        )}
        {step === 'garden' && (
          <TextStep
            title={`${name}，给你的花园起个名字吧`}
            value={gardenName}
            onChange={setGardenName}
            placeholder="比如：彩虹花园"
            onNext={() => setStep('look')}
            onBack={() => setStep('name')}
          />
        )}
        {step === 'look' && (
          <>
            <Mascot size={88} bounce />
            <h1 className="ob-title">选一个喜欢的颜色</h1>
            <div className="ob-row">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`swatch${theme === t.id ? ' selected' : ''}`}
                  style={{ background: t.color }}
                  onClick={() => setTheme(t.id)}
                  aria-label={t.name}
                >
                  <span className="swatch-label">{t.name}</span>
                </button>
              ))}
            </div>
            <h2 className="ob-sub">小屋的屋顶是什么颜色？</h2>
            <div className="ob-row">
              {HOUSE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`roof${houseColor === c ? ' selected' : ''}`}
                  onClick={() => setHouseColor(c)}
                  aria-label={c}
                >
                  <svg width="56" height="40" viewBox="0 0 56 40">
                    <path d="M4 34 L28 6 L52 34 Z" fill={c} stroke="#5B4366" strokeWidth="3" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
            <Nav onBack={() => setStep('garden')} onNext={() => setStep('mascot')} />
          </>
        )}
        {step === 'mascot' && (
          <TextStep
            title="这是你的小花苞精灵，给它起个名字吧"
            value={mascotName}
            onChange={setMascotName}
            placeholder="精灵的名字"
            mascot
            onNext={() => setStep('pin')}
            onBack={() => setStep('look')}
          />
        )}
        {step === 'pin' && (
          <>
            <h1 className="ob-title">请爸爸妈妈设置 4 位密码</h1>
            <p className="ob-hint">进入家长模式时使用，请不要告诉小朋友哦</p>
            <PinPad
              key="pin1"
              onComplete={(p) => {
                setPin(p)
                setPinError('')
                setStep('pin2')
              }}
            />
            <Nav onBack={() => setStep('mascot')} />
          </>
        )}
        {step === 'pin2' && (
          <>
            <h1 className="ob-title">再输入一次确认</h1>
            {pinError && <p className="ob-hint" style={{ color: 'var(--primary-dark)' }}>{pinError}</p>}
            <PinPad
              key="pin2"
              onComplete={(p) => {
                if (p === pin && isValidPin(p)) setStep('home')
                else {
                  setPinError('两次输入不一样，请重新设置')
                  setStep('pin')
                }
              }}
            />
            <Nav onBack={() => setStep('pin')} />
          </>
        )}
        {step === 'home' && (
          <>
            <Mascot size={110} bounce />
            <h1 className="ob-title">最后一步：添加到主屏幕</h1>
            <ol className="ob-steps">
              <li>点 Safari 右上角的 <b>分享</b> 按钮 <span aria-hidden>⬆️</span></li>
              <li>选择 <b>添加到主屏幕</b></li>
              <li>以后都从主屏幕上的 <b>小花园</b> 图标打开</li>
            </ol>
            <p className="ob-hint">
              从 Safari 标签页和从主屏幕打开是两份不同的数据，所以一定要从主屏幕图标打开哦。
              {isStandalone() && ' （现在已经是从主屏幕打开的，太棒了！）'}
            </p>
            <button className="btn btn-primary btn-big" disabled={busy} onClick={finish}>
              进入花园 🌷
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function TextStep(props: {
  title: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  onNext: () => void
  onBack?: () => void
  mascot?: boolean
}) {
  const ok = props.value.trim().length > 0
  return (
    <>
      <Mascot size={props.mascot ? 120 : 88} bounce />
      <h1 className="ob-title">{props.title}</h1>
      <input
        className="input ob-input"
        value={props.value}
        maxLength={12}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ok && props.onNext()}
      />
      <Nav onBack={props.onBack} onNext={props.onNext} nextDisabled={!ok} />
    </>
  )
}

function Nav({ onBack, onNext, nextDisabled }: { onBack?: () => void; onNext?: () => void; nextDisabled?: boolean }) {
  return (
    <div className="ob-nav">
      {onBack && <button className="btn btn-ghost" onClick={onBack}>← 上一步</button>}
      {onNext && <button className="btn btn-primary btn-big" onClick={onNext} disabled={nextDisabled}>下一步</button>}
    </div>
  )
}
