import type { CSSProperties, ReactNode } from 'react'

// 自绘图标：粗圆描边、圆润造型，带豆豆眼和粉色腮红
const STROKE = '#5B4366'

function Face({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  return (
    <g>
      <circle cx={cx - 6 * s} cy={cy} r={2.2 * s} fill={STROKE} />
      <circle cx={cx + 6 * s} cy={cy} r={2.2 * s} fill={STROKE} />
      <ellipse cx={cx - 10 * s} cy={cy + 5 * s} rx={3 * s} ry={2 * s} fill="#FF9EC0" opacity={0.7} />
      <ellipse cx={cx + 10 * s} cy={cy + 5 * s} rx={3 * s} ry={2 * s} fill="#FF9EC0" opacity={0.7} />
    </g>
  )
}

const ART: Record<string, ReactNode> = {
  mound: (
    <g>
      <path d="M10 46 Q32 22 54 46 Z" fill="#C99A6B" stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <Face cx={32} cy={39} s={0.7} />
    </g>
  ),
  'rainbow-flower': (
    <g>
      <path d="M32 60 V36" stroke="#3FAE86" strokeWidth={4} strokeLinecap="round" />
      {['#FF7A7A', '#FFB86B', '#FFE16B', '#7ED7B5', '#7CC8F8', '#B79CED'].map((c, i) => (
        <ellipse key={c} cx={32} cy={14} rx={7} ry={13} fill={c} stroke={STROKE} strokeWidth={2} transform={`rotate(${i * 60} 32 26)`} />
      ))}
      <circle cx={32} cy={26} r={10} fill="#FFF3C4" stroke={STROKE} strokeWidth={2.5} />
      <Face cx={32} cy={25} s={0.55} />
    </g>
  ),
  'book-flower': (
    <g>
      <path d="M32 60 V38" stroke="#3FAE86" strokeWidth={4} strokeLinecap="round" />
      <path d="M8 18 Q20 12 32 20 Q44 12 56 18 V40 Q44 34 32 42 Q20 34 8 40 Z" fill="#FFF" stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M32 20 V42" stroke={STROKE} strokeWidth={2.5} />
      <Face cx={32} cy={30} s={0.6} />
    </g>
  ),
  'note-flower': (
    <g>
      <path d="M32 60 V36" stroke="#3FAE86" strokeWidth={4} strokeLinecap="round" />
      <circle cx={32} cy={26} r={18} fill="#B79CED" stroke={STROKE} strokeWidth={3} />
      <path d="M28 34 V16 L40 13 V30" fill="none" stroke="#FFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={25} cy={34} r={4} fill="#FFF" />
      <circle cx={37} cy={30} r={4} fill="#FFF" />
    </g>
  ),
  'star-tree': (
    <g>
      <rect x={28} y={40} width={8} height={20} rx={3} fill="#C99A6B" stroke={STROKE} strokeWidth={2.5} />
      <path d="M32 4 L40 20 L58 22 L44 34 L48 52 L32 43 L16 52 L20 34 L6 22 L24 20 Z" fill="#FFD66B" stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <Face cx={32} cy={28} s={0.7} />
    </g>
  ),
  'crystal-lotus': (
    <g>
      <ellipse cx={32} cy={52} rx={24} ry={7} fill="#7CC8F8" stroke={STROKE} strokeWidth={2.5} />
      <path d="M32 14 L40 34 L32 48 L24 34 Z" fill="#E6F6FF" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M18 26 L32 48 L14 42 Z M46 26 L32 48 L50 42 Z" fill="#CDEBFF" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <Face cx={32} cy={34} s={0.5} />
    </g>
  ),
  path: <rect x={6} y={6} width={52} height={52} rx={16} fill="#E9DDD3" stroke="#BFAE9F" strokeWidth={3} />,
  scarecrow: (
    <g>
      <path d="M32 26 V60 M12 34 H52" stroke="#A0703F" strokeWidth={5} strokeLinecap="round" />
      <circle cx={32} cy={20} r={11} fill="#FFE2A8" stroke={STROKE} strokeWidth={2.5} />
      <path d="M16 12 H48 L40 4 H24 Z" fill="#E85A8F" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <Face cx={32} cy={20} s={0.55} />
    </g>
  ),
  arch: (
    <g>
      <path d="M8 60 V30 A24 24 0 0 1 56 30 V60" fill="none" stroke="#7ED7B5" strokeWidth={7} strokeLinecap="round" />
      {[[10, 34], [18, 16], [32, 8], [46, 16], [54, 34]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="#FF9EC0" stroke={STROKE} strokeWidth={2} />
      ))}
    </g>
  ),
  pond: (
    <g>
      <ellipse cx={32} cy={34} rx={28} ry={20} fill="#7CC8F8" stroke={STROKE} strokeWidth={3} />
      <ellipse cx={24} cy={30} rx={8} ry={3} fill="#CDEBFF" />
    </g>
  ),
  swing: (
    <g>
      <path d="M8 60 L16 6 H48 L56 60" fill="none" stroke="#A0703F" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 8 V44 M40 8 V44" stroke={STROKE} strokeWidth={2} />
      <rect x={20} y={42} width={24} height={6} rx={3} fill="#FF9EC0" stroke={STROKE} strokeWidth={2.5} />
    </g>
  ),
  'golden-swing': (
    <g>
      <path d="M8 60 L16 6 H48 L56 60" fill="none" stroke="#E0A92A" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 8 V44 M40 8 V44" stroke={STROKE} strokeWidth={2} />
      <rect x={20} y={42} width={24} height={6} rx={3} fill="#FFD66B" stroke={STROKE} strokeWidth={2.5} />
    </g>
  ),
  'star-lamp': (
    <g>
      <path d="M32 60 V24" stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
      <path d="M32 4 L37 14 L48 15 L40 22 L42 33 L32 28 L22 33 L24 22 L16 15 L27 14 Z" fill="#FFD66B" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
    </g>
  ),
  rug: <rect x={4} y={10} width={56} height={44} rx={20} fill="#FFB5CF" stroke="#E85A8F" strokeWidth={3} strokeDasharray="6 5" />,
  desk: (
    <g>
      <rect x={4} y={20} width={56} height={10} rx={4} fill="#D9A877" stroke={STROKE} strokeWidth={2.5} />
      <path d="M10 30 V56 M54 30 V56" stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
    </g>
  ),
  'floor-wood': <rect x={4} y={4} width={56} height={56} rx={12} fill="#E3B98C" stroke="#B98A5E" strokeWidth={3} />,
  'floor-tile': <rect x={4} y={4} width={56} height={56} rx={12} fill="#F5F1EC" stroke="#D9D3DC" strokeWidth={3} />,
  'wall-pink': <rect x={4} y={4} width={56} height={56} rx={12} fill="#FFE6EF" stroke="#FF9EC0" strokeWidth={3} />,
  'wall-green': <rect x={4} y={4} width={56} height={56} rx={12} fill="#E3F7EF" stroke="#7ED7B5" strokeWidth={3} />,
  'wall-stars': (
    <g>
      <rect x={4} y={4} width={56} height={56} rx={12} fill="#4B3D7A" stroke="#B79CED" strokeWidth={3} />
      <circle cx={18} cy={20} r={2.5} fill="#FFD66B" />
      <circle cx={42} cy={16} r={2} fill="#FFF" />
      <circle cx={34} cy={40} r={2.5} fill="#FFD66B" />
    </g>
  ),
}

export function SvgArt({ id, size = 40, style }: { id: string; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={style} aria-hidden>
      {ART[id] ?? <circle cx={32} cy={32} r={20} fill="#FFE6EF" stroke={STROKE} strokeWidth={3} />}
    </svg>
  )
}
