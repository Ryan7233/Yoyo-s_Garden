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

/** 顶部高光（左上来光） */
const HL = '#FFFFFF'

const ART: Record<string, ReactNode> = {
  // ---- 生长阶段 ----
  mound: (
    <g>
      <path d="M8 56 Q32 30 56 56 Z" fill="#C28C5A" stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M16 50 Q26 38 36 38" fill="none" stroke={HL} strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
      <path d="M40 56 Q46 46 52 52" fill="#9A6A40" opacity={0.5} />
      <ellipse cx={32} cy={41} rx={4} ry={3} fill="#F7E3B8" stroke={STROKE} strokeWidth={2} />
      <Face cx={32} cy={49} s={0.55} />
    </g>
  ),
  sprout: (
    <g>
      <ellipse cx={32} cy={58} rx={12} ry={4} fill="#7A5233" opacity={0.45} />
      <path d="M32 58 V30" stroke="#4F9146" strokeWidth={4} strokeLinecap="round" />
      <path d="M32 34 Q18 34 14 22 Q28 18 32 34 Z" fill="#A9DC83" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M32 30 Q44 28 50 16 Q36 14 32 30 Z" fill="#8FCD6B" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M18 24 Q24 23 27 28" fill="none" stroke={HL} strokeOpacity={0.6} strokeWidth={2} strokeLinecap="round" />
    </g>
  ),
  sapling: (
    <g>
      <ellipse cx={32} cy={60} rx={13} ry={4} fill="#7A5233" opacity={0.45} />
      <path d="M32 60 V18" stroke="#4F9146" strokeWidth={4} strokeLinecap="round" />
      <path d="M32 46 Q16 48 10 36 Q24 30 32 46 Z" fill="#A9DC83" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M32 38 Q48 40 54 28 Q40 22 32 38 Z" fill="#8FCD6B" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M32 26 Q20 24 18 12 Q30 10 32 26 Z" fill="#A9DC83" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={33} cy={14} r={6} fill="var(--primary, #FF9EC0)" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={31} cy={12} r={2} fill={HL} opacity={0.7} />
    </g>
  ),
  'young-tree': (
    <g>
      <ellipse cx={32} cy={61} rx={14} ry={4} fill="#7A5233" opacity={0.45} />
      <path d="M29 61 L30 36 H35 L36 61 Z" fill="#B4824F" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={32} cy={26} r={16} fill="#8FCD6B" stroke={STROKE} strokeWidth={2.5} />
      <path d="M40 38 Q48 30 44 20" fill="none" stroke="#6CAE53" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <circle cx={26} cy={20} r={5} fill="#C9EC9F" />
    </g>
  ),
  // ---- 花园主要物件 ----
  tree: (
    <g>
      <path d="M27 62 L28 36 H37 L38 62 Z" fill="#B4824F" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M34 40 V60" stroke="#8D5F36" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <circle cx={20} cy={30} r={14} fill="#8FCD6B" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={44} cy={30} r={14} fill="#7CC160" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={32} cy={18} r={16} fill="#9AD776" stroke={STROKE} strokeWidth={2.5} />
      <path d="M50 38 Q56 30 52 22" fill="none" stroke="#5E9F4B" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      <ellipse cx={25} cy={12} rx={7} ry={4.5} fill="#D6F3B5" transform="rotate(-25 25 12)" />
      <circle cx={13} cy={28} r={3} fill="#D6F3B5" />
      <circle cx={42} cy={28} r={2.6} fill="#FF9EC0" stroke={STROKE} strokeWidth={1.5} />
      <circle cx={22} cy={36} r={2.6} fill="#FF9EC0" stroke={STROKE} strokeWidth={1.5} />
    </g>
  ),
  // ---- 室内主要家具 ----
  chair: (
    <g>
      <path d="M18 28 V8 Q18 4 22 4 H42 Q46 4 46 8 V28" fill="#DDAA74" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M22 10 H42 M22 18 H42" stroke="#B4824F" strokeWidth={2.5} />
      <path d="M22 7 H34" stroke={HL} strokeOpacity={0.6} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M18 40 V60 M46 40 V60" stroke="#B4824F" strokeWidth={5} strokeLinecap="round" />
      <path d="M18 40 V60 M46 40 V60" stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <path d="M12 30 Q12 26 16 26 H48 Q52 26 52 30 V36 Q52 40 48 40 H16 Q12 40 12 36 Z" fill="#F0CFA4" stroke={STROKE} strokeWidth={2.5} />
      <path d="M12 34 H52 V36 Q52 40 48 40 H16 Q12 40 12 36 Z" fill="#B4824F" opacity={0.45} />
      <rect x={20} y={27} width={24} height={6} rx={3} fill="var(--primary, #FF9EC0)" opacity={0.85} />
    </g>
  ),
  vase: (
    <g>
      <path d="M24 10 H40 V18 Q50 24 50 40 Q50 58 32 58 Q14 58 14 40 Q14 24 24 18 Z" fill="#9FC9F0" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M42 26 Q50 36 46 50 Q42 56 34 57 Q46 50 44 34 Z" fill="#5E8FC4" opacity={0.45} />
      <path d="M20 30 Q22 24 27 21" fill="none" stroke={HL} strokeOpacity={0.75} strokeWidth={3} strokeLinecap="round" />
      <rect x={22} y={6} width={20} height={6} rx={3} fill="#C2DDF6" stroke={STROKE} strokeWidth={2.5} />
      <path d="M17 40 Q32 46 47 40" fill="none" stroke="#FFF" strokeOpacity={0.7} strokeWidth={2.5} strokeDasharray="1 5" strokeLinecap="round" />
    </g>
  ),
  // ---- 余额小徽章 ----
  coin: (
    <g>
      <circle cx={32} cy={34} r={26} fill="#D99A1C" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={32} cy={30} r={26} fill="#FFD66B" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={32} cy={30} r={18} fill="none" stroke="#E8B238" strokeWidth={3} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={32} cy={23} rx={4} ry={6} fill="#F2B83A" transform={`rotate(${a} 32 30)`} />
      ))}
      <circle cx={32} cy={30} r={4} fill="#FFF3C4" />
      <path d="M14 22 Q20 10 32 8" fill="none" stroke={HL} strokeOpacity={0.8} strokeWidth={3.5} strokeLinecap="round" />
    </g>
  ),
  drop: (
    <g>
      <path d="M32 4 Q52 28 52 40 Q52 60 32 60 Q12 60 12 40 Q12 28 32 4 Z" fill="#7CC8F8" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M44 34 Q48 48 38 56 Q50 52 50 40 Z" fill="#3D9FDC" opacity={0.5} />
      <path d="M22 38 Q22 28 30 18" fill="none" stroke={HL} strokeOpacity={0.85} strokeWidth={4} strokeLinecap="round" />
      <circle cx={24} cy={46} r={2.5} fill={HL} opacity={0.8} />
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
  path: (
    <g>
      <rect x={2} y={4} width={60} height={56} rx={16} fill="#D9C3A4" opacity={0.75} />
      {[[18, 18, 12, 9], [44, 16, 11, 8], [30, 36, 13, 9], [14, 50, 10, 7], [48, 46, 11, 8]].map(([cx, cy, rx, ry]) => (
        <g key={`${cx}-${cy}`}>
          <ellipse cx={cx} cy={cy + 2.5} rx={rx} ry={ry} fill="#BFAE9F" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#EFE7DC" stroke="#A8957F" strokeWidth={1.5} />
          <ellipse cx={cx - rx * 0.35} cy={cy - ry * 0.35} rx={rx * 0.35} ry={ry * 0.25} fill="#FFF" opacity={0.7} />
        </g>
      ))}
    </g>
  ),
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
  rug: (
    <g>
      <ellipse cx={32} cy={36} rx={30} ry={22} fill="#D86E98" />
      <ellipse cx={32} cy={33} rx={30} ry={22} fill="#FFB5CF" stroke={STROKE} strokeWidth={2} />
      <ellipse cx={32} cy={33} rx={23} ry={16} fill="none" stroke="#FFF" strokeWidth={2.5} strokeDasharray="4 4" />
      <ellipse cx={32} cy={33} rx={12} ry={8} fill="#FFE6EF" />
      <path d="M12 24 Q20 14 32 12" fill="none" stroke="#FFF" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  desk: (
    <g>
      <rect x={4} y={20} width={56} height={10} rx={4} fill="#D9A877" stroke={STROKE} strokeWidth={2.5} />
      <path d="M10 30 V56 M54 30 V56" stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
    </g>
  ),
  'floor-wood': <rect x={4} y={4} width={56} height={56} rx={12} fill="#E3B98C" stroke="#B98A5E" strokeWidth={3} />,
  'floor-tile': <rect x={4} y={4} width={56} height={56} rx={12} fill="#F5F1EC" stroke="#D9D3DC" strokeWidth={3} />,
  'wall-default': (
    <g>
      <rect x={4} y={4} width={56} height={56} rx={12} fill="#FFE6EF" stroke="#FF9EC0" strokeWidth={3} />
      <path d="M20 8 V56 M32 8 V56 M44 8 V56" stroke="#FFC4D8" strokeWidth={3} />
    </g>
  ),
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

/** 宽物件（2 × 1）用 128 × 64 的画布 */
const WIDE: Record<string, ReactNode> = {
  bed: (
    <g>
      {/* 床腿和侧面 */}
      <rect x={10} y={46} width={8} height={12} rx={3} fill="#B4824F" stroke={STROKE} strokeWidth={2.5} />
      <rect x={110} y={46} width={8} height={12} rx={3} fill="#B4824F" stroke={STROKE} strokeWidth={2.5} />
      {/* 床头板 */}
      <path d="M6 54 V18 Q6 8 18 8 H24 Q32 8 32 18 V54 Z" fill="#DDAA74" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M11 20 Q11 13 18 13 H22" fill="none" stroke="#FFF" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
      {/* 床垫 */}
      <rect x={28} y={30} width={94} height={20} rx={8} fill="#FFFDF8" stroke={STROKE} strokeWidth={2.5} />
      <rect x={28} y={42} width={94} height={8} rx={4} fill="#000" opacity={0.06} />
      {/* 被子（主题色） */}
      <path d="M58 28 H118 Q124 28 124 34 V44 Q124 50 118 50 H58 Z" style={{ fill: 'var(--primary)' }} stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M58 28 H118 Q124 28 124 34 V36 H58 Z" fill="#FFF" opacity={0.35} />
      <path d="M64 50 V28" stroke={STROKE} strokeWidth={2} opacity={0.5} />
      {[76, 92, 108].map((x) => <circle key={x} cx={x} cy={41} r={2.6} fill="#FFF" opacity={0.75} />)}
      {/* 枕头 */}
      <rect x={34} y={20} width={24} height={14} rx={7} fill="#FFF" stroke={STROKE} strokeWidth={2.5} />
      <path d="M38 24 Q44 22 50 23" fill="none" stroke="#E7DCEB" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ),
}

export function SvgArt({ id, size = 40, style, fluid }: { id: string; size?: number; style?: CSSProperties; fluid?: boolean }) {
  const wide = WIDE[id]
  const w = fluid ? '100%' : wide ? size * 2 : size
  const h = fluid ? '100%' : size
  return (
    <svg width={w} height={h} viewBox={wide ? '0 0 128 64' : '0 0 64 64'} style={style} aria-hidden preserveAspectRatio="xMidYMax meet">
      {wide ?? ART[id] ?? <circle cx={32} cy={32} r={20} fill="#FFE6EF" stroke={STROKE} strokeWidth={3} />}
    </svg>
  )
}
