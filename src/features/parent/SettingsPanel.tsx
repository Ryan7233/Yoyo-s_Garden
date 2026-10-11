import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { changePin, updateChild, updateSettings } from '../../db/actions'
import { isValidPin } from '../../engine/pin'
import { usePwa } from '../../app/pwa'
import { PinPad } from '../../ui/PinPad'
import { Modal } from '../../ui/Modal'

export function SettingsPanel() {
  const { child, settings } = useStore()
  const { needRefresh, update, check } = usePwa()
  const [name, setName] = useState(child?.name ?? '')
  const [gardenName, setGardenName] = useState(child?.gardenName ?? '')
  const [pinOpen, setPinOpen] = useState(false)
  const [msg, setMsg] = useState('')
  if (!child || !settings) return null

  return (
    <div className="panel">
      <label className="check row">
        <input type="checkbox" checked={settings.sound} onChange={(e) => act(() => updateSettings({ sound: e.target.checked }))} />
        <span className="row-title">音效</span>
      </label>
      <div className="form">
        <label>孩子名字<input className="input" value={name} maxLength={12} onChange={(e) => setName(e.target.value)} /></label>
        <label>花园名<input className="input" value={gardenName} maxLength={12} onChange={(e) => setGardenName(e.target.value)} /></label>
        <button
          className="btn btn-primary"
          disabled={!name.trim() || !gardenName.trim()}
          onClick={async () => {
            await act(() => updateChild(child.id, { name: name.trim(), gardenName: gardenName.trim() }))
            setMsg('✓ 已保存')
          }}
        >
          保存名字
        </button>
      </div>
      <div className="row">
        <span className="row-icon">🔒</span>
        <div className="row-main"><div className="row-title">修改家长密码</div></div>
        <button className="btn btn-ghost" onClick={() => setPinOpen(true)}>修改</button>
      </div>
      <div className="row">
        <span className="row-icon">🆕</span>
        <div className="row-main">
          <div className="row-title">{needRefresh ? '有新版本，点击更新' : '检查新版本'}</div>
          <div className="row-sub">更新只在这里进行，不会打断孩子使用</div>
        </div>
        {needRefresh ? (
          <button className="btn btn-primary" onClick={update}>更新</button>
        ) : (
          <button className="btn btn-ghost" onClick={async () => { await check(); setMsg(usePwa.getState().needRefresh ? '发现新版本' : '已经是最新版本') }}>检查</button>
        )}
      </div>
      {msg && <p>{msg}</p>}
      {pinOpen && (
        <Modal onClose={() => setPinOpen(false)}>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>输入新的 4 位密码</h2>
          <PinPad
            onComplete={async (p) => {
              if (!isValidPin(p)) return
              await act(() => changePin(p))
              setPinOpen(false)
              setMsg('✓ 密码已修改')
            }}
          />
        </Modal>
      )}
    </div>
  )
}
