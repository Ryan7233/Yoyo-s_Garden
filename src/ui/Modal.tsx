import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './modal.css'

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * 弹窗：挂到 body 上，不受所在面板滚动或动画的影响。
 * 打开时把焦点移进弹窗，Tab 只在弹窗内切换，Esc 关闭，关闭后焦点回到打开它的按钮。
 */
export function Modal({ children, onClose, wide }: { children: ReactNode; onClose?: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    ref.current?.focus({ preventScroll: true })
    return () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // React 事件会穿过 portal 冒泡：嵌套弹窗里的按键只由最里层处理
    if ((e.target as HTMLElement).closest('[role=dialog]') !== ref.current) return
    if (e.key === 'Escape') {
      // 只关最上面这一层
      e.stopPropagation()
      onClose?.()
      return
    }
    if (e.key !== 'Tab' || !ref.current) return
    const list = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    if (!list.length) {
      e.preventDefault()
      return
    }
    const first = list[0]
    const last = list[list.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === ref.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className={`modal card pop${wide ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
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
