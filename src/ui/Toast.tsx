import { create } from 'zustand'
import './toast.css'

interface ToastState {
  text: string
  id: number
  show: (text: string) => void
}

export const useToast = create<ToastState>((set) => ({
  text: '',
  id: 0,
  show(text) {
    const id = Date.now()
    set({ text, id })
    setTimeout(() => set((s) => (s.id === id ? { text: '' } : s)), 2200)
  },
}))

export function toast(text: string) {
  useToast.getState().show(text)
}

/** 轻提示，不用警告式文案 */
export function ToastHost() {
  const { text, id } = useToast()
  if (!text) return null
  return (
    <div className="toast pop" key={id} onClick={() => useToast.setState({ text: '' })}>
      {text}
    </div>
  )
}
