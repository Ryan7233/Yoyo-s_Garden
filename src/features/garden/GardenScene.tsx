import { useState, type CSSProperties } from 'react'
import { useStore, act } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { POND_ID } from '../../data/plants'
import { Mascot } from '../../ui/Mascot'
import { ScrollHints } from '../../ui/ScrollHints'
import { ConfirmDialog } from '../../ui/Modal'
import { toast } from '../../ui/Toast'
import { House } from './House'
import { PlantArt } from './PlantArt'
import { PlantSheet } from './PlantSheet'
import { SeedPicker } from './SeedPicker'
import { SKY, skyPhase } from './sky'
import { HOUSE_RECT, expandCandidates } from '../../engine/plots'
import { getCatalogItem } from '../../data/catalog'
import { expandPlot } from '../../db/garden'
import { PlacedView, placedProps } from '../decorate/PlacedView'
import { PlacementLayer } from '../decorate/PlacementLayer'
import { Visitors } from './Visitors'
import { WishBar } from './WishBar'
import { Horizon, GroundDecor } from './Scenery'
import { CourageSunflower } from '../courage/CourageSunflower'
import './garden.css'

type Fx = { id: string; kind: 'water' | 'grow' }

/**
 * 室外花园：天空 → 远景树丛 → 小屋和种植区 → 前景草地。
 * 场景本身就是 DOM 网格，点击、拖拽和占格预览都用同一套格子坐标；
 * 格子最小 64px，屏幕放不下时整片花园可以滑动，而不是继续缩小。
 */
export function GardenScene({ onEnterHouse }: { onEnterHouse: () => void }) {
  const { child, plots, plants, placed, today, balance, decorating } = useStore()
  const [plantId, setPlantId] = useState<string | null>(null)
  const [emptyPlot, setEmptyPlot] = useState<{ x: number; y: number; pondId?: string } | null>(null)
  const [expanding, setExpanding] = useState(false)
  const [expandAt, setExpandAt] = useState<{ x: number; y: number } | null>(null)
  const [fx, setFx] = useState<Fx | null>(null)
  if (!child) return null

  const phase = skyPhase(new Date().getHours())
  const outdoorPlants = plants.filter((p) => p.scene === 'outdoor')
  const outdoorPlaced = placed.filter((p) => p.scene === 'outdoor')
  const sized = outdoorPlaced.map((p) => {
    const s = getCatalogItem(p.catalogId)?.size ?? [1, 1]
    return { ...p, w: s[0], h: s[1] }
  })
  const candidates = expanding ? expandCandidates(plots, sized) : []
  const soilCount = plots.filter((p) => p.kind === 'soil').length

  const showFx = (f: Fx) => {
    setFx(f)
    setTimeout(() => setFx((cur) => (cur === f ? null : cur)), 1200)
  }

  const tapPond = (pondId: string, x: number, y: number) => {
    if (expanding || decorating) return
    const p = outdoorPlants.find((q) => q.pondId === pondId)
    if (p) setPlantId(p.id)
    else setEmptyPlot({ x, y, pondId })
  }

  const tapPlot = (x: number, y: number) => {
    if (expanding || decorating) return
    const p = outdoorPlants.find((q) => !q.pondId && q.x === x && q.y === y)
    if (p) setPlantId(p.id)
    else setEmptyPlot({ x, y })
  }

  const gridStyle = {
    '--cols': BALANCE.gridWidth,
    '--rows': BALANCE.gridHeight,
  } as CSSProperties

  return (
    <>
      <ScrollHints />
      <div className="scene-scroll">
        <div className={`garden phase-${phase}`} style={gridStyle}>
          <div className="sky" style={{ background: SKY[phase] }}>
            {phase === 'night' ? <div className="moon" /> : <div className="sun" />}
            {phase === 'night' && <div className="stars" />}
            <div className="cloud" style={{ top: '22%', animationDuration: '110s' }} />
            <div className="cloud small" style={{ top: '48%', animationDuration: '150s', animationDelay: '-70s' }} />
            <Horizon night={phase === 'night'} />
          </div>
          <div className="ground-wrap">
            <GroundDecor />
            <div className="ground">
              <button className="house-cell" style={cell(HOUSE_RECT.x, HOUSE_RECT.y, HOUSE_RECT.w, HOUSE_RECT.h)} onClick={onEnterHouse} aria-label="进入小屋">
                <House roof={child.houseColor} fluid />
              </button>
              {!decorating && <CourageSunflower />}

              {plots.map((p) => (
                <button
                  key={`${p.x}-${p.y}`}
                  className={`plot ${p.kind}`}
                  style={cell(p.x, p.y)}
                  onClick={() => tapPlot(p.x, p.y)}
                  aria-label="地块"
                />
              ))}

              {outdoorPlaced.map((p) => (
                <PlacedView key={p.id} {...placedProps(p)} onTap={p.catalogId === POND_ID ? () => tapPond(p.id, p.x, p.y) : undefined} />
              ))}

              {outdoorPlants.map((p) => (
                <div key={p.id} className={`plant${p.pondId ? ' in-pond' : ''}`} style={p.pondId ? cell(p.x, p.y, 2, 2) : cell(p.x, p.y)}>
                  <PlantArt plant={p} today={today} fluid hop={fx?.id === p.id && fx.kind === 'grow'} />
                  {fx?.id === p.id && <span className="fx">{fx.kind === 'grow' ? '💗' : '💧'}</span>}
                </div>
              ))}

              {decorating && <PlacementLayer scene="outdoor" layer="ground" cols={BALANCE.gridWidth} rows={BALANCE.gridHeight} />}

              {candidates.map((c) => (
                <button key={`c${c.x}-${c.y}`} className="expand-cell pop" style={cell(c.x, c.y)} onClick={() => setExpandAt(c)} aria-label="扩建这里">
                  <span>＋</span>
                </button>
              ))}
            </div>
          </div>
          <Visitors scene="outdoor" />
        </div>
      </div>

      {/* 浮在天空上的工具：不随场景滑动，也不盖住地块 */}
      {!decorating && (
        <div className="scene-overlay top">
          {!expanding && <WishBar />}
          <span className="spacer" />
          {expanding ? (
            <>
              <span className="scene-hint pop">点一个“＋”，花 {BALANCE.plotExpandCost} 金币开一块新地</span>
              <button className="btn btn-primary" onClick={() => setExpanding(false)}>完成扩建</button>
            </>
          ) : (
            soilCount < BALANCE.maxPlots && (
              <button className="btn" onClick={() => setExpanding(true)}>🧱 扩建地块</button>
            )
          )}
        </div>
      )}

      {outdoorPlants.length === 0 && !expanding && !decorating && (
        <div className="garden-empty">
          <span className="bubble">{child.mascotName}：点一块空地，种下第一颗种子吧</span>
          <Mascot size={72} bounce />
        </div>
      )}

      {plantId && (
        <PlantSheet
          plantId={plantId}
          onClose={() => setPlantId(null)}
          onWatered={(id, stageUp) => showFx({ id, kind: stageUp ? 'grow' : 'water' })}
        />
      )}
      {emptyPlot && <SeedPicker x={emptyPlot.x} y={emptyPlot.y} pondId={emptyPlot.pondId} onClose={() => setEmptyPlot(null)} />}
      {expandAt && (
        <ConfirmDialog
          title={`花 ${BALANCE.plotExpandCost} 金币开一块新地？`}
          message={
            balance.coin < BALANCE.plotExpandCost
              ? `还差 ${BALANCE.plotExpandCost - balance.coin} 金币`
              : `买完还剩 ${balance.coin - BALANCE.plotExpandCost} 金币`
          }
          confirmText="开地"
          onCancel={() => setExpandAt(null)}
          onConfirm={async () => {
            const r = await act(() => expandPlot(child.id, expandAt.x, expandAt.y))
            setExpandAt(null)
            if (r.ok) toast('新地块开好啦！')
            else if (r.reason === 'coins') toast(`还差 ${BALANCE.plotExpandCost - balance.coin} 金币，完成任务可以攒金币`)
          }}
        />
      )}
    </>
  )
}

export function cell(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}
