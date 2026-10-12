const INK = '#5B4366'

/** 原创吉祥物：小花苞精灵。和场景物件同一套光照：左上高光，右下略深，脚下有影子 */
export function Mascot({ size = 96, bounce = false }: { size?: number; bounce?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={bounce ? 'bounce' : undefined} aria-hidden>
      <ellipse cx={50} cy={95} rx={20} ry={3.5} fill="rgba(70,45,30,.2)" />
      <path d="M50 93 V74" stroke="#4F9146" strokeWidth={5} strokeLinecap="round" />
      <path d="M50 86 Q32 76 26 87 Q40 95 50 86 Z" fill="#8FCD6B" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M50 81 Q68 71 74 82 Q60 90 50 81 Z" fill="#7CC160" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M31 85 Q36 82 41 84" fill="none" stroke="#D6F3B5" strokeWidth={2} strokeLinecap="round" />
      {/* 花苞身体 */}
      <path
        d="M50 10 Q65 20 73 33 Q84 52 73 67 Q63 79 50 79 Q37 79 27 67 Q16 52 27 33 Q35 20 50 10 Z"
        fill="var(--primary, #FF9EC0)"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* 右下的暗面 */}
      <path d="M72 38 Q82 56 70 69 Q61 78 50 79 Q66 70 70 54 Q72 46 72 38 Z" fill="rgba(90,40,70,.16)" />
      {/* 花瓣中线与高光 */}
      <path d="M50 10 Q43 29 50 44 Q57 29 50 10 Z" fill="var(--primary-light, #FFE6EF)" opacity={0.85} />
      <path d="M31 40 Q34 28 42 21" fill="none" stroke="#FFF" strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
      <g style={{ transformOrigin: '50px 55px', animation: 'blink 4s infinite' }}>
        <circle cx={41} cy={55} r={3.6} fill={INK} />
        <circle cx={59} cy={55} r={3.6} fill={INK} />
        <circle cx={42.2} cy={53.8} r={1.1} fill="#FFF" />
        <circle cx={60.2} cy={53.8} r={1.1} fill="#FFF" />
      </g>
      <ellipse cx={34} cy={63} rx={5} ry={3} fill="#FF6FA0" opacity={0.5} />
      <ellipse cx={66} cy={63} rx={5} ry={3} fill="#FF6FA0" opacity={0.5} />
      <path d="M45 64 Q50 69 55 64" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}
