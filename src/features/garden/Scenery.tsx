import { BALANCE } from '../../data/balance'
import { project } from './projection'

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

/** 地面插画与可点击格共享投影。SVG 单位分别对应半格宽和半格高。 */
export function Meadow() {
  const { gridWidth: cols, gridHeight: rows } = BALANCE
  const span = cols + rows
  const top = `${rows},0 ${span},${cols} ${cols},${span} 0,${rows}`
  return (
    <svg className="meadow" viewBox={`0 0 ${span} ${span}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="turf" x2=".6" y2="1">
          <stop stopColor="#dfefae" /><stop offset=".48" stopColor="#b8df91" /><stop offset="1" stopColor="#99ce84" />
        </linearGradient>
        <g id="grass-blades" fill="none" stroke="#75ac68" strokeWidth=".034" strokeLinecap="round">
          <path d="M-.09 0l-.06-.10M0 .02l.02-.15M.07 0l.08-.07" />
        </g>
        <g id="field-daisy">
          <path d="M0 0q.04-.11 .01-.19" fill="none" stroke="#629957" strokeWidth=".034" />
          <path d="M0-.07q-.11-.12-.13-.05t.13.05" fill="#7dac61" />
          <g fill="#fff8d7">
            <ellipse cy="-.22" rx=".044" ry=".09" />
            <ellipse cy="-.22" rx=".09" ry=".044" />
          </g>
          <circle cy="-.22" r=".035" fill="#ebb75d" />
        </g>
      </defs>
      <path d={`M0 ${rows}L${cols} ${span}L${span} ${cols}v.36L${cols} ${span + .36}L0 ${rows + .36}Z`} fill="#ab9068" />
      <path d={`M0 ${rows}L${cols} ${span}L${span} ${cols}v.18L${cols} ${span + .18}L0 ${rows + .18}Z`} fill="#82a76b" />
      <polygon points={top} fill="url(#turf)" stroke="#81b273" strokeWidth=".045" strokeLinejoin="round" />
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = i % cols
        const y = Math.floor(i / cols)
        const { u, v } = project(x, y)
        return (
          <g key={i} transform={`translate(${u} ${v})`}>
            <path d="M0 0l1 1-1 1-1-1z" fill={(x + y) % 2 ? '#ffffff' : '#63955d'} fillOpacity=".065" />
            {i % 4 === 0 && <use href="#grass-blades" x="-.34" y="1.10" />}
            {i % 9 === 2 && <use href="#field-daisy" x=".36" y=".96" />}
          </g>
        )
      })}
      {[0, 1, 2, 3].map(i => {
        const { u, v } = project(1.8 + i * .42, 3 + i * .26)
        return <ellipse key={i} cx={u} cy={v} rx=".22" ry=".12" fill="#e6dfbd" stroke="#afa985" strokeWidth=".035" />
      })}
    </svg>
  )
}
