import type { ReactNode } from 'react'
import './modal.css'

export function Modal({ children, onClose, wide }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal card pop${wide ? ' modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/** 不可逆操作的二次确认 */
export function ConfirmDialog({
  title, message, confirmText = '确定', cancelText = '再想想', onConfirm, onCancel,
}: {
  title: string
  message?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal onClose={onCancel}>
      <h2 style={{ fontSize: 30, marginBottom: 12 }}>{title}</h2>
      {message && <div style={{ color: 'var(--text-soft)', marginBottom: 24 }}>{message}</div>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
        <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  )
}
