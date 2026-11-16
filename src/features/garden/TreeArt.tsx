// 平面花园里的果树：和 3D 一样看得出是哪种树，枝头跟着长——摘完只剩叶子、开花、青果、熟了
const STROKE = '#5B4366'

export type FruitKind = 'apple' | 'orange' | 'peach'
export const fruitKindOf = (catalogId: string): FruitKind | null =>
  (['apple', 'orange', 'peach'] as const).find((k) => catalogId === `seed-${k}-tree`) ?? null

const CROWN: Record<FruitKind, string[]> = {
  apple: ['#8FCD6B', '#7CC160', '#9AD776'],
  orange: ['#6DB25A', '#5EA04E', '#7CC066'],
  peach: ['#B5D97A', '#A6CF6C', '#C3E28A'],
}
/** 桃花先开花后长叶，开花的桃树几乎是粉色的 */
const PEACH_BLOOM = ['#F7B6C8', '#F3A3BB', '#FAC6D3']
const FRUIT: Record<FruitKind, string> = { apple: '#E8453C', orange: '#F7A23A', peach: '#FFC48C' }
const BLOSSOM: Record<FruitKind, string> = { apple: '#FFF0F4', orange: '#FFFDF6', peach: '#FF9FBC' }
const SPOTS: [number, number][] = [[17, 27], [45, 27], [31, 12], [39, 37], [23, 38], [47, 15], [14, 15]]

function Fruit({ kind, x, y }: { kind: FruitKind; x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y - 4} q1 -3 3 -4`} stroke="#6B4A2E" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y} r={5} fill={FRUIT[kind]} stroke={STROKE} strokeWidth={1.8} />
      {kind === 'peach' && (
        <>
          <ellipse cx={x + 1.8} cy={y + 0.6} rx={3} ry={4} fill="#F06B7A" opacity={0.85} />
          <circle cx={x} cy={y} r={5} fill="none" stroke={STROKE} strokeWidth={1.8} />
        </>
      )}
      {kind === 'apple' && <ellipse cx={x + 2.6} cy={y - 5.6} rx={2.4} ry={1.2} fill="#5E9F4B" transform={`rotate(-30 ${x + 2.6} ${y - 5.6})`} />}
      <circle cx={x - 1.8} cy={y - 1.8} r={1.4} fill="#FFF" opacity={0.75} />
    </g>
  )
}

function Blossom({ color, x, y }: { color: string; x: number; y: number }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2
        return <circle key={i} cx={x + Math.cos(a) * 2.6} cy={y + Math.sin(a) * 2.6} r={2.2} fill={color} stroke={STROKE} strokeWidth={0.9} />
      })}
      <circle cx={x} cy={y} r={1.3} fill="#F4C84F" />
    </g>
  )
}

/** level：0 刚摘完只有叶子、1 开花、2 青果、3 熟了可以摘（见 engine/growth fruitLevel） */
export function TreeArt({ kind, level, size = 48, fluid }: { kind: FruitKind; level: 0 | 1 | 2 | 3; size?: number; fluid?: boolean }) {
  const crown = kind === 'peach' && level === 1 ? PEACH_BLOOM : CROWN[kind]
  const s = fluid ? '100%' : size
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden preserveAspectRatio="xMidYMax meet" style={{ overflow: 'visible' }}>
      <path d="M27 62 L28 38 H37 L38 62 Z" fill="#B4824F" stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      {kind === 'peach' && <path d="M32 44 L20 34 M33 44 L45 33" stroke="#B4824F" strokeWidth={4} strokeLinecap="round" />}
      <circle cx={19} cy={29} r={kind === 'orange' ? 13 : 14} fill={crown[0]} stroke={STROKE} strokeWidth={2.5} />
      <circle cx={45} cy={29} r={kind === 'orange' ? 13 : 14} fill={crown[1]} stroke={STROKE} strokeWidth={2.5} />
      <circle cx={32} cy={kind === 'orange' ? 16 : 18} r={kind === 'orange' ? 18 : 16} fill={crown[2]} stroke={STROKE} strokeWidth={2.5} />
      <ellipse cx={25} cy={11} rx={7} ry={4.5} fill="#FFFFFF" opacity={0.35} transform="rotate(-25 25 11)" />
      {SPOTS.map(([x, y], i) =>
        level === 3 ? (
          <Fruit key={i} kind={kind} x={x} y={y} />
        ) : level === 2 && i % 2 === 0 ? (
          <circle key={i} cx={x} cy={y} r={3.2} fill="#DBE28A" stroke={STROKE} strokeWidth={1.4} />
        ) : level === 1 ? (
          <Blossom key={i} color={BLOSSOM[kind]} x={x} y={y} />
        ) : null,
      )}
    </svg>
  )
}
