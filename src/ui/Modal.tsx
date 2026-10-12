import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './modal.css'

/** 弹窗：挂到 body 上，不受所在面板滚动或动画的影响 */
export function Modal({ children, onClose, wide }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal card pop${wide ? ' modal-wide' : ''}`} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
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
      <h2 className="modal-title">{title}</h2>
      {message && <div className="modal-text">{message}</div>}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
        <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  )
}
