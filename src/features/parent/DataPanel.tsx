import { useRef, useState } from 'react'
import { useStore, act } from '../../app/store'
import { exportBackup, importBackup, markBackedUp, parseBackup, shareOrDownload, summarize, type BackupFile } from '../../db/backup'
import { resetAll } from '../../db/actions'
import { Modal, ConfirmDialog } from '../../ui/Modal'

export function DataPanel() {
  const settings = useStore((s) => s.settings)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [pending, setPending] = useState<BackupFile | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetText, setResetText] = useState('')

  const doExport = async () => {
    const f = await exportBackup()
    const r = await shareOrDownload(f)
    if (r !== 'cancelled') {
      await act(() => markBackedUp())
      setMsg('✓ 备份已导出')
    }
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setPending(parseBackup(await file.text()))
      setMsg('')
    } catch (e) {
      setMsg(`✗ ${(e as Error).message}`)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const sum = pending && summarize(pending)

  return (
    <div className="panel">
      <div className="row">
        <span className="row-icon">💾</span>
        <div className="row-main">
          <div className="row-title">导出备份</div>
          <div className="row-sub">上次备份：{settings?.lastBackupAt ? new Date(settings.lastBackupAt).toLocaleString('zh-CN') : '还没有备份过'}</div>
        </div>
        <button className="btn btn-primary" onClick={doExport}>导出</button>
      </div>
      <div className="row">
        <span className="row-icon">📥</span>
        <div className="row-main">
          <div className="row-title">导入备份</div>
          <div className="row-sub">会覆盖当前所有数据，导入前会先显示摘要</div>
        </div>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>选择文件</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <div className="row">
        <span className="row-icon">🗑️</span>
        <div className="row-main">
          <div className="row-title">重置全部数据</div>
          <div className="row-sub">清空所有记录和花园，回到首次启动。建议先导出备份。</div>
        </div>
        <button className="btn btn-ghost" onClick={() => { setResetOpen(true); setResetText('') }}>重置</button>
      </div>
      {msg && <p>{msg}</p>}

      {pending && sum && (
        <ConfirmDialog
          title="用这份备份覆盖当前数据？"
          message={
            <div className="text-left">
              <p>备份日期：{new Date(sum.exportedAt).toLocaleString('zh-CN')}</p>
              <p>孩子：{sum.childName}</p>
              <p>金币 🪙 {sum.coins}　水滴 💧 {sum.drops}</p>
              <p>物品 {sum.itemCount} 件　有记录的天数 {sum.recordDays} 天</p>
            </div>
          }
          confirmText="覆盖导入"
          onCancel={() => setPending(null)}
          onConfirm={async () => {
            await act(() => importBackup(pending))
            setPending(null)
            setMsg('✓ 导入完成')
          }}
        />
      )}

      {resetOpen && (
        <Modal onClose={() => setResetOpen(false)}>
          <h2 className="modal-title">真的要重置吗？</h2>
          <p className="modal-text">请输入“确认重置”四个字</p>
          <input className="input" value={resetText} onChange={(e) => setResetText(e.target.value)} />
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setResetOpen(false)}>取消</button>
            <button
              className="btn btn-primary"
              disabled={resetText.trim() !== '确认重置'}
              onClick={async () => {
                await resetAll()
                location.reload()
              }}
            >
              重置
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
