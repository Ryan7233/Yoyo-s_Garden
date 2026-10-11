/** 原创吉祥物：小花苞精灵 */
export function Mascot({ size = 96, bounce = false }: { size?: number; bounce?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={bounce ? 'bounce' : undefined} aria-hidden>
      <path d="M50 92 V74" stroke="#3FAE86" strokeWidth={5} strokeLinecap="round" />
      <path d="M50 84 Q34 76 30 86 Q42 92 50 84 Z" fill="#7ED7B5" stroke="#5B4366" strokeWidth={2.5} />
      <path d="M50 80 Q66 72 70 82 Q58 88 50 80 Z" fill="#7ED7B5" stroke="#5B4366" strokeWidth={2.5} />
      <path
        d="M50 12 Q64 22 72 34 Q82 52 72 66 Q62 78 50 78 Q38 78 28 66 Q18 52 28 34 Q36 22 50 12 Z"
        fill="var(--primary, #FF9EC0)"
        stroke="#5B4366"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M50 12 Q44 30 50 44 Q56 30 50 12 Z" fill="var(--primary-light, #FFE6EF)" opacity={0.8} />
      <g style={{ transformOrigin: '50px 54px', animation: 'blink 4s infinite' }}>
        <circle cx={41} cy={54} r={3.5} fill="#5B4366" />
        <circle cx={59} cy={54} r={3.5} fill="#5B4366" />
      </g>
      <ellipse cx={35} cy={62} rx={5} ry={3} fill="#FF6FA0" opacity={0.55} />
      <ellipse cx={65} cy={62} rx={5} ry={3} fill="#FF6FA0" opacity={0.55} />
      <path d="M45 63 Q50 68 55 63" fill="none" stroke="#5B4366" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}
