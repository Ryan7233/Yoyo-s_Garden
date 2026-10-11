import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { BALANCE } from '../../data/balance'
import { getCatalogItem } from '../../data/catalog'
import { POND_ID } from '../../data/plants'
import { Mascot } from '../../ui/Mascot'
import { ConfirmDialog } from '../../ui/Modal'
import { toast } from '../../ui/Toast'
import { House } from './House'
import { PlantArt } from './PlantArt'
import { PlantSheet } from './PlantSheet'
import { SeedPicker } from './SeedPicker'
import { SKY, skyPhase } from './sky'
import { HOUSE_RECT, expandCandidates } from '../../engine/plots'
import { expandPlot } from '../../db/garden'
import { PlacedView, placedProps } from '../decorate/PlacedView'
import { PlacementLayer } from '../decorate/PlacementLayer'
import { ItemMenu } from '../decorate/ItemMenu'
import { Visitors } from './Visitors'
import { WishBar } from './WishBar'
import './garden.css'

type Fx = { id: string; kind: 'water' | 'grow' }

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

  return (
    <div className="garden" style={{ background: SKY[phase] }}>
      <div className="sky">
        {phase === 'night' && <div className="stars" />}
        <div className="cloud" style={{ top: '18%', animationDuration: '90s' }} />
        <div className="cloud small" style={{ top: '40%', animationDuration: '130s', animationDelay: '-60s' }} />
      </div>
      <div
        className="ground"
        style={{
          gridTemplateColumns: `repeat(${BALANCE.gridWidth}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BALANCE.gridHeight}, minmax(0, 1fr))`,
        }}
      >
        <button className="house-cell" style={cell(HOUSE_RECT.x, HOUSE_RECT.y, HOUSE_RECT.w, HOUSE_RECT.h)} onClick={onEnterHouse} aria-label="进入小屋">
          <House roof={child.houseColor} size={150} />
        </button>

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
          <PlacedView key={p.id} {...placedProps(p)} size={48} onTap={p.catalogId === POND_ID ? () => tapPond(p.id, p.x, p.y) : undefined} />
        ))}

        {outdoorPlants.map((p) => (
          <div key={p.id} className={`plant${p.pondId ? ' in-pond' : ''}`} style={p.pondId ? cell(p.x, p.y, 2, 2) : cell(p.x, p.y)}>
            <PlantArt plant={p} today={today} hop={fx?.id === p.id && fx.kind === 'grow'} />
            {fx?.id === p.id && <span className="fx">{fx.kind === 'grow' ? '💗' : '💧'}</span>}
          </div>
        ))}

        {decorating && <PlacementLayer scene="outdoor" layer="ground" cols={BALANCE.gridWidth} rows={BALANCE.gridHeight} />}

        {candidates.map((c) => (
          <button key={`c${c.x}-${c.y}`} className="expand-cell pop" style={cell(c.x, c.y)} onClick={() => setExpandAt(c)} aria-label="扩建这里">
            ＋
          </button>
        ))}
      </div>

      <Visitors scene="outdoor" />
      {!decorating && !expanding && <WishBar />}
      {decorating && <ItemMenu />}
      {!decorating && <div className="garden-tools">
        {expanding ? (
          <button className="btn btn-primary" onClick={() => setExpanding(false)}>完成扩建</button>
        ) : (
          soilCount < BALANCE.maxPlots && (
            <button className="btn btn-ghost" onClick={() => setExpanding(true)}>🧱 扩建地块</button>
          )
        )}
      </div>}
      {expanding && <div className="garden-hint pop">点一个“＋”，花 {BALANCE.plotExpandCost} 金币开一块新地</div>}

      {outdoorPlants.length === 0 && !expanding && !decorating && (
        <div className="garden-empty">
          <Mascot size={72} bounce />
          <span className="bubble">{child.mascotName}：点一块空地，种下第一颗种子吧</span>
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
    </div>
  )
}

export function cell(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}
