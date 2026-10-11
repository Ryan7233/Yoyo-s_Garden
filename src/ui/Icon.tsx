import type { CSSProperties } from 'react'
import { SvgArt } from './SvgArt'

/** emoji 直接显示；'svg:xxx' 用自绘 SVG */
export function Icon({ icon, size = 40, style }: { icon: string; size?: number; style?: CSSProperties }) {
  if (icon.startsWith('svg:')) return <SvgArt id={icon.slice(4)} size={size} style={style} />
  return (
    <span role="img" aria-hidden style={{ fontSize: size * 0.85, lineHeight: 1, display: 'inline-block', ...style }}>
      {icon}
    </span>
  )
}
