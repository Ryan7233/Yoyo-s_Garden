const INK = '#5B4366'

/** 一朵花：花瓣 + 花盘，略微朝上 */
function Head({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.95} rx={r * 0.32} ry={r * 0.62} fill="#FFD23F" stroke={INK} strokeWidth={2}
          transform={`rotate(${i * 30})`} />
      ))}
      <circle r={r * 0.62} fill="#9A5B2E" stroke={INK} strokeWidth={2.5} />
      <circle r={r * 0.36} fill="#7A4521" />
      <circle cx={-r * 0.2} cy={-r * 0.22} r={r * 0.12} fill="#C27E4A" />
    </g>
  )
}

/**
 * 勇气向日葵，3 级：越高、花越多。
 * 1 级：一朵小花；2 级：更高，两朵；3 级：最高，三朵，花盘最大。
 */
export function SunflowerArt({ level, size = 120 }: { level: 1 | 2 | 3; size?: number }) {
  const top = [0, 78, 46, 18][level]
  const heads: { x: number; y: number; r: number }[] = [
    [],
    [{ x: 50, y: top, r: 15 }],
    [{ x: 52, y: top, r: 17 }, { x: 30, y: top + 34, r: 11 }],
    [{ x: 50, y: top, r: 19 }, { x: 28, y: top + 36, r: 13 }, { x: 74, y: top + 52, r: 11 }],
  ][level]
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 100 150" aria-hidden>
      <ellipse cx={50} cy={144} rx={24} ry={5} fill="rgba(70,45,30,.22)" />
      {/* 主茎和侧枝 */}
      <path d={`M50 142 C52 120 48 ${top + 40} 50 ${top}`} fill="none" stroke="#5E9E4A" strokeWidth={6} strokeLinecap="round" />
      {heads.slice(1).map((h, i) => (
        <path key={i} d={`M50 ${h.y + 24} Q${(h.x + 50) / 2} ${h.y + 14} ${h.x} ${h.y}`} fill="none" stroke="#5E9E4A" strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* 叶子 */}
      <path d="M50 118 Q30 104 22 116 Q34 126 50 120 Z" fill="#7CC36A" stroke={INK} strokeWidth={2} />
      <path d="M51 104 Q72 90 80 102 Q66 112 51 106 Z" fill="#7CC36A" stroke={INK} strokeWidth={2} />
      {heads.map((h, i) => <Head key={i} {...h} />)}
    </svg>
  )
}
