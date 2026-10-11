/** 圆润的童话小屋，屋顶用孩子选的颜色 */
export function House({ roof, size = 180 }: { roof: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <rect x={22} y={52} width={76} height={58} rx={14} fill="#FFF3E6" stroke="#5B4366" strokeWidth={3.5} />
      <path d="M8 60 Q60 4 112 60 Q112 66 104 66 H16 Q8 66 8 60 Z" fill={roof} stroke="#5B4366" strokeWidth={3.5} strokeLinejoin="round" />
      <rect x={48} y={74} width={24} height={36} rx={12} fill="#D9A877" stroke="#5B4366" strokeWidth={3} />
      <circle cx={66} cy={93} r={2.5} fill="#5B4366" />
      <rect x={30} y={74} width={13} height={13} rx={4} fill="#CDEBFF" stroke="#5B4366" strokeWidth={2.5} />
      <rect x={77} y={74} width={13} height={13} rx={4} fill="#CDEBFF" stroke="#5B4366" strokeWidth={2.5} />
    </svg>
  )
}
