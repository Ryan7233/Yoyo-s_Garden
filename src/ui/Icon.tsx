import type { CSSProperties } from 'react'
import { SvgArt } from './SvgArt'

/**
 * emoji 或自绘图标（'svg:' 开头）。
 * fluid：填满父元素（场景里的物件按格子大小缩放，emoji 字号由 CSS 变量 --obj 决定）。
 */
export function Icon({ icon, size = 40, style, fluid }: { icon: string; size?: number; style?: CSSProperties; fluid?: boolean }) {
  if (icon.startsWith('svg:')) return <SvgArt id={icon.slice(4)} size={size} style={style} fluid={fluid} />
  return (
    <span
      role="img"
      aria-hidden
      className={fluid ? 'emoji emoji-fluid' : 'emoji'}
      style={fluid ? style : { fontSize: size * 0.85, lineHeight: 1, display: 'inline-block', ...style }}
    >
      {icon}
    </span>
  )
}
