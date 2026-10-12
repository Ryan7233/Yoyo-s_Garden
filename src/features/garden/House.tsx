const INK = '#5B4366'

/**
 * 圆润的童话小屋：轻微俯视的 3/4 视角，屋顶有顶面和侧面厚度，
 * 屋檐下有阴影，门窗略微内凹，门前有台阶。屋顶用孩子选的颜色。
 */
export function House({ roof, size, fluid }: { roof: string; size?: number; fluid?: boolean }) {
  const roofSide = `color-mix(in srgb, ${roof} 70%, #4a2a3c)`
  const roofTop = `color-mix(in srgb, ${roof} 82%, #ffffff)`
  return (
    <svg
      width={fluid ? '100%' : size ?? 180}
      height={fluid ? '100%' : size ?? 180}
      viewBox="0 0 160 150"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      {/* 接触阴影 */}
      <ellipse cx={86} cy={140} rx={66} ry={8} fill="rgba(70,45,30,.22)" />
      {/* 侧墙（右侧，略深） */}
      <path d="M118 66 L146 54 V120 Q146 126 140 128 L118 134 Z" fill="#EBD3B8" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M125 84 L138 79 V96 L125 101 Z" fill="#A9D3F5" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {/* 正面墙 */}
      <rect x={24} y={62} width={96} height={72} rx={10} fill="#FFF4E6" stroke={INK} strokeWidth={3} />
      <path d="M30 70 V124" stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={4} strokeLinecap="round" />
      {/* 屋檐阴影 */}
      <path d="M26 64 H118 V74 Q72 80 26 74 Z" fill="rgba(90,50,40,.16)" />
      {/* 烟囱 */}
      <rect x={104} y={14} width={14} height={26} rx={3} fill="#E4A98F" stroke={INK} strokeWidth={3} />
      <rect x={101} y={10} width={20} height={8} rx={3} fill="#D38F76" stroke={INK} strokeWidth={3} />
      {/* 屋顶：侧面厚度 + 正面 */}
      <path d="M78 10 L150 52 Q152 58 146 58 L120 68 L80 22 Z" style={{ fill: roofSide }} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M78 10 Q72 8 66 14 L12 62 Q8 70 16 70 H124 Q132 70 128 62 L84 14 Q82 10 78 10 Z" style={{ fill: roof }} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {/* 屋顶顶面高光 + 瓦片线 */}
      <path d="M74 18 L30 58" stroke={roofTop} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      <path d="M40 52 Q52 48 60 52 M56 40 Q66 36 74 40 M72 30 Q80 26 86 30 M84 44 Q94 40 102 44 M66 56 Q78 52 88 56 M96 58 Q106 54 114 58" fill="none" stroke={INK} strokeOpacity={0.22} strokeWidth={2.5} strokeLinecap="round" />
      {/* 窗户（内凹：外框深一点，里面亮） */}
      {[34, 92].map((x) => (
        <g key={x}>
          <rect x={x - 2} y={84} width={22} height={22} rx={7} fill="#E6CDB1" stroke={INK} strokeWidth={2.5} />
          <rect x={x + 1} y={87} width={16} height={16} rx={5} fill="#BFE3FF" />
          <path d={`M${x + 9} 87 V103 M${x + 1} 95 H${x + 17}`} stroke="#FFF" strokeWidth={2.5} />
          <path d={`M${x + 3} 90 L${x + 7} 90`} stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" />
          <rect x={x - 4} y={106} width={26} height={7} rx={3} fill="#9AD776" stroke={INK} strokeWidth={2.5} />
          <circle cx={x + 3} cy={105} r={3} fill="#FF9EC0" stroke={INK} strokeWidth={1.5} />
          <circle cx={x + 13} cy={105} r={3} fill="#FFD66B" stroke={INK} strokeWidth={1.5} />
        </g>
      ))}
      {/* 门：门框内凹，圆顶门 */}
      <path d="M58 134 V104 Q58 86 72 86 Q86 86 86 104 V134 Z" fill="#C99367" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M62 134 V105 Q62 91 72 91 Q82 91 82 105 V134 Z" fill="#E2AE7E" />
      <path d="M66 108 Q66 96 72 95" fill="none" stroke="#FFF" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
      <circle cx={78} cy={116} r={2.8} fill={INK} />
      <path d="M72 91 V134" stroke={INK} strokeOpacity={0.2} strokeWidth={2} />
      {/* 门前台阶 */}
      <rect x={52} y={132} width={40} height={8} rx={4} fill="#E9E1D6" stroke={INK} strokeWidth={2.5} />
      <rect x={48} y={138} width={48} height={8} rx={4} fill="#DDD2C3" stroke={INK} strokeWidth={2.5} />
    </svg>
  )
}
