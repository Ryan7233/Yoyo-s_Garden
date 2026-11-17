import type { CSSProperties } from 'react'
import type { PlantInstance } from '../../data/types'
import { getCatalogItem } from '../../data/catalog'
import { Icon } from '../../ui/Icon'

const vars = (v: Record<string, string>) => v as CSSProperties

/** 喷壶：飞到植物上方，歪一下，水珠落下来 */
function Can() {
  return (
    <svg className="fx-can" viewBox="0 0 64 48" aria-hidden>
      <path d="M8 14 Q-4 26 10 34" fill="none" stroke="#5B4366" strokeWidth={7} strokeLinecap="round" />
      <path d="M8 14 Q-4 26 10 34" fill="none" stroke="#8FD0E8" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M38 26 L56 10 L60 15 L42 34 Z" fill="#8FD0E8" stroke="#5B4366" strokeWidth={2.5} strokeLinejoin="round" />
      <ellipse cx={58} cy={11} rx={5} ry={7.5} transform="rotate(42 58 11)" fill="#C9ECF7" stroke="#5B4366" strokeWidth={2.5} />
      <rect x={10} y={12} width={32} height={30} rx={8} fill="#8FD0E8" stroke="#5B4366" strokeWidth={2.5} />
      <path d="M15 18 Q15 16 19 16 H28" fill="none" stroke="#FFF" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" />
      <circle cx={21} cy={28} r={2} fill="#5B4366" />
      <circle cx={32} cy={28} r={2} fill="#5B4366" />
      <ellipse cx={17} cy={33} rx={3} ry={2} fill="#FF9EC0" opacity={0.8} />
      <ellipse cx={36} cy={33} rx={3} ry={2} fill="#FF9EC0" opacity={0.8} />
    </svg>
  )
}

/**
 * 平面花园里的过程动画，和 3D 里是同一套：浇水时喷壶歪过来洒水，
 * 收获时果子一颗颗跳进篮子、篮子里蹦出金币。plant 是动作发生前的那一株。
 */
export function PlantFx({ kind, plant }: { kind: 'water' | 'grow' | 'harvest'; plant: PlantInstance }) {
  if (kind !== 'harvest')
    return (
      <>
        <Can />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="fx-drop" style={vars({ '--dx': `${(i % 3) * 9 - 9}%`, '--d': `${0.42 + i * 0.09}s` })} />
        ))}
        {kind === 'grow' && <span className="fx fx-late">💗</span>}
      </>
    )
  const item = getCatalogItem(plant.catalogId)
  const tree = plant.catalogId.endsWith('-tree')
  const n = tree ? 5 : 3
  return (
    <>
      <span className="fx-basket" style={vars({ '--n': String(n) })}>🧺</span>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="fx-fruit" style={vars({ '--sx': `${24 + ((i * 37) % 44)}%`, '--sy': `${(tree ? 8 : 20) + ((i * 23) % 30)}%`, '--d': `${0.25 + i * 0.13}s` })}>
          <span><Icon icon={item?.icon ?? '🌼'} size={20} style={{ fontSize: '1em' }} /></span>
        </span>
      ))}
      {[0, 1, 2].map((i) => (
        <span key={i} className="fx-coin" style={vars({ '--cx': `${(i - 1) * 0.7}em`, '--d': `${0.25 + n * 0.13 + 0.5 + i * 0.08}s` })}>
          <Icon icon="svg:coin" size={22} style={{ width: '1em', height: '1em' }} />
        </span>
      ))}
    </>
  )
}
