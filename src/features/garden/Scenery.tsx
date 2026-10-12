// 花园布景：远景山丘和树丛、草地上的小花石子、门前小路、前景草丛。纯装饰，不接收点击。
const INK = '#5B4366'

/** 天空底部的远景：两层山丘 + 一排圆润树丛（宽度随场景拉伸） */
export function Horizon({ night }: { night?: boolean }) {
  const far = night ? '#5e5a9c' : '#bfe6b8'
  const near = night ? '#4c7a6a' : '#9fd88a'
  const bush = night ? '#3f6b55' : '#7fc66a'
  const bushHi = night ? '#5f8f74' : '#a6dd8a'
  return (
    <svg className="horizon" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden>
      <path d="M0 60 Q120 20 260 46 T520 40 T800 34 T1060 44 T1200 30 V90 H0 Z" fill={far} />
      <path d="M0 72 Q160 44 340 66 T700 62 T1000 58 T1200 64 V90 H0 Z" fill={near} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 40 + i * 75 + (i % 3) * 9
        const r = 22 + ((i * 7) % 3) * 6
        return (
          <g key={i}>
            <circle cx={x} cy={88 - r * 0.55} r={r} fill={bush} stroke={INK} strokeOpacity={0.25} strokeWidth={2} />
            <circle cx={x - r * 0.35} cy={88 - r * 0.9} r={r * 0.35} fill={bushHi} />
          </g>
        )
      })}
    </svg>
  )
}

// 草地小花和石子：用场景比例摆放，避开中间的地块
const FLOWERS: [number, number][] = [
  [4, 70], [9, 88], [27, 92], [31, 30], [44, 22], [52, 90], [61, 12], [70, 84], [79, 30], [86, 60], [93, 18], [96, 86], [38, 66], [64, 50],
]
const PEBBLES: [number, number, number][] = [
  [6, 54, 1], [24, 80, 0.8], [47, 8, 0.9], [58, 76, 1.1], [74, 16, 0.8], [90, 44, 1], [83, 92, 0.9],
]
const TUFTS: [number, number][] = [
  [2, 40], [15, 94], [34, 12], [50, 58], [66, 30], [76, 68], [88, 8], [98, 52], [20, 62],
]

export function GroundDecor() {
  return (
    <div className="ground-decor" aria-hidden>
      {FLOWERS.map(([x, y], i) => (
        <svg key={`f${i}`} className="decor flower" style={{ left: `${x}%`, top: `${y}%` }} viewBox="0 0 20 20">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={10} cy={5.5} rx={3.2} ry={4.2} fill="#FFFFFF" stroke="#E6D9E8" strokeWidth={0.8} transform={`rotate(${a} 10 10)`} />
          ))}
          <circle cx={10} cy={10} r={2.6} fill={i % 3 === 0 ? '#FF9EC0' : '#FFD66B'} />
        </svg>
      ))}
      {PEBBLES.map(([x, y, s], i) => (
        <svg key={`p${i}`} className="decor pebble" style={{ left: `${x}%`, top: `${y}%`, width: 22 * s, height: 14 * s }} viewBox="0 0 22 14">
          <ellipse cx={11} cy={8} rx={10} ry={5.5} fill="#C8BBA9" />
          <ellipse cx={10} cy={6.5} rx={9} ry={5} fill="#E9E1D6" />
          <ellipse cx={7} cy={5} rx={3} ry={1.5} fill="#FFF" opacity={0.7} />
        </svg>
      ))}
      {TUFTS.map(([x, y], i) => (
        <svg key={`t${i}`} className="decor tuft" style={{ left: `${x}%`, top: `${y}%` }} viewBox="0 0 30 18">
          <path d="M3 18 Q6 6 10 2 Q10 10 13 18 Q15 4 19 0 Q19 10 21 18 Q24 8 28 6 Q26 12 27 18 Z" fill="#7FC66A" />
          <path d="M10 4 Q9 10 11 16" stroke="#C9EC9F" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </svg>
      ))}
      {/* 门前的踏脚石，从小屋台阶走向菜地 */}
      {[[1.45, 3.15], [1.95, 3.55], [2.55, 3.85]].map(([cx, cy], i) => (
        <span key={`s${i}`} className="stepping-stone" style={{ left: `calc(var(--pad) + ${cx} * var(--cw))`, top: `calc(var(--pad) + ${cy} * var(--ch))` }} />
      ))}
      <div className="ground-front" />
    </div>
  )
}
