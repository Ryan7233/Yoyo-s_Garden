import { Mascot } from '../ui/Mascot'

export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0' }}>
      <h2 style={{ fontSize: 34 }}>{title}</h2>
      <Mascot size={120} bounce />
      <p style={{ color: 'var(--text-soft)', fontSize: 22, textAlign: 'center' }}>{text}</p>
    </div>
  )
}
