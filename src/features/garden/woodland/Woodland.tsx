import { useEffect, useRef, useState, type PointerEvent, type MouseEvent } from 'react'
import { useStore } from '../../../app/store'
import { BALANCE } from '../../../data/balance'
import { getCatalogItem } from '../../../data/catalog'
import { POND_ID } from '../../../data/plants'
import { canHarvest, fruitLevel, isThirsty } from '../../../engine/growth'
import { buildSceneState, canPlace, footprintOf, slotFor } from '../../../engine/placement'
import { sunflowerLevel } from '../../../engine/courage'
import { useHere } from '../Visitors'
import { CourageSheet } from '../../courage/CourageSunflower'
import { useDecorate, canvasCells } from '../../decorate/useDecorate'
import { startPress } from '../../decorate/drag'
import { dropAt } from '../../decorate/actions'
import { toast } from '../../../ui/Toast'
import { play } from '../../../ui/sfx'
import { animal, furniture } from './furniture'
import { cottage, plant } from './models'
import { bed, createWorld, orchardYard, pit, type Toy } from './world'
import { ORCHARD_PITS, pitAt, plantRect } from '../../../engine/plots'
import './woodland.css'

interface Props {
  onHouse: () => void
  onPlot: (x: number, y: number) => void
  onPond: (id: string, x: number, y: number) => void
  candidates: { x: number; y: number }[]
  onExpand: (cell: { x: number; y: number }) => void
  onExit: () => void
  /** A plant or seed card is open over the bottom of the screen. */
  carded?: boolean
}
export default function Woodland({ onHouse, onPlot, onPond, candidates, onExpand, onExit, carded = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const world = useRef<ReturnType<typeof createWorld> | null>(null)
  const pointer = useRef<{ x: number; y: number; lastX: number; lastY: number; moved: boolean } | null>(null)
  const tapped = useRef(false)
  /** Every finger on the canvas, so two of them can pinch to zoom. */
  const fingers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; midX: number; midY: number } | null>(null)
  const [near, setNear] = useState(false),
    [failed, setFailed] = useState(false),
    [courage, setCourage] = useState(false)
  const { child, plots, plants, placed, decorating, settings, today } = useStore()
  const { holding, hover } = useDecorate()
  const visitors = useHere('outdoor', 'wood')
  const level = sunflowerLevel(settings?.courageWeeks?.length ?? 0)
  const actions = new Map<string, () => void>()
  const toys: Toy[] = []
  const spots = new Map<string, Toy>()
  const add = (toy: Toy, action?: () => void) => {
    toys.push(toy)
    spots.set(toy.key, toy)
    if (action) actions.set(toy.key, action)
  }
  const roof = child?.houseColor ?? '#e995ad'
  add({ key: 'house', model: 'house' + roof, carve: (m) => cottage(m, roof), x: 1.5, z: 1.5 }, onHouse)
  add({ key: 'orchard', model: 'orchard', carve: orchardYard, x: 0, z: 0, hit: false })
  for (const r of ORCHARD_PITS)
    add({ key: 'pit-' + r.x + '-' + r.y, model: 'pit', carve: pit, x: r.x + 1, z: r.y + 1 }, () => onPlot(r.x, r.y))
  for (const p of plots)
    add({ key: 'bed-' + p.x + '-' + p.y, model: 'bed', carve: bed, x: p.x + 0.5, z: p.y + 0.5 }, () => onPlot(p.x, p.y))
  const outdoors = placed.filter((p) => p.scene === 'outdoor')
  for (const p of outdoors) {
    const [w, h] = getCatalogItem(p.catalogId)?.size ?? [1, 1]
    add(
      {
        key: p.id,
        model: p.catalogId,
        carve: (m) => furniture(m, p.catalogId),
        x: p.x + w / 2,
        z: p.y + h / 2,
        angle: p.flipped ? Math.PI : 0,
      },
      p.catalogId === POND_ID ? () => onPond(p.id, p.x, p.y) : undefined,
    )
  }
  for (const p of plants.filter((p) => p.scene === 'outdoor')) {
    const spec = getCatalogItem(p.catalogId)?.plant
    const span = plantRect(p),
      orchard = !p.pondId && span.w > 1
    const x = p.x + span.w / 2,
      z = p.y + span.h / 2
    const tap = () => (p.pondId ? onPond(p.pondId, p.x, p.y) : onPlot(p.x, p.y))
    const fruit = spec && p.catalogId.endsWith('-tree') ? fruitLevel(p, spec) : 0
    add(
      {
        key: p.id,
        model: p.catalogId + p.stage + '/' + fruit,
        carve: (m) => plant(m, p.catalogId, p.stage, fruit),
        x,
        z,
        // In the orchard trees stand on the grass and get room to be big; elsewhere they sit in a bed.
        y: orchard ? 0.03 : 0.204,
        angle: 0.25 + Math.sin(p.x * 3 + p.y) * 0.44,
        size: orchard ? 1.3 : p.catalogId.endsWith('-tree') ? 0.74 : 1,
      },
      tap,
    )
    const ripe = spec && canHarvest(p, spec)
    if (!decorating && spec && (ripe || isThirsty(p, today, spec)))
      add(
        {
          key: 'mark' + p.id,
          model: ripe ? 'ripe' : 'water',
          carve: (m) => {
            if (ripe) {
              m.ball('#ffdb70', [0, 0, 0], [0.042, 0.125, 0.044])
              m.ball('#ffdb70', [0, 0, 0], [0.116, 0.042, 0.045])
            } else {
              m.ball('#59abcf', [0, 0, 0], [0.074, 0.084, 0.06])
              m.cone('#71c5dc', [0, 0.075, 0], [0.065, 0.12, 0.055])
            }
          },
          x: x + 0.32,
          z: z + 0.31,
          y: 0.38,
        },
        tap,
      )
  }
  if (level && !decorating)
    add(
      {
        key: 'courage',
        model: 'courage',
        carve: (m) => plant(m, 'seed-sunflower', 3),
        x: 0.5,
        z: 2.52,
        size: 0.85 + level * 0.13,
      },
      () => setCourage(true),
    )
  if (!decorating)
    for (const { v, anchor, offset } of visitors) {
      const fly = ['butterfly', 'bee'].includes(v.id),
        bird = v.id === 'bird'
      add(
        {
          key: v.id,
          model: 'animal-' + v.id,
          carve: (m) => animal(m, v.id),
          x: (anchor ? anchor.x + anchor.w / 2 : 9.4) + offset * 0.42 + (fly ? 0.34 : 0.04),
          z: (anchor ? anchor.y + anchor.h / 2 : 6.2) + (fly ? -0.24 : bird ? 0.05 : 0.47),
          y: fly ? 1.36 : bird ? (anchor?.catalogId === 'out-birdhouse' ? 1.78 : 1.27) : 0.18,
          fly,
          angle: 0.48,
        },
        () => {
          play('visitor')
          toast(v.name + '：' + v.line)
        },
      )
    }
  for (const c of candidates)
    add(
      {
        key: 'expand' + c.x + '-' + c.y,
        model: 'expand',
        x: c.x + 0.5,
        z: c.y + 0.5,
        carve: (m) => {
          m.box('#cee5a4', [0, 0.05, 0], [0.79, 0.09, 0.79])
          m.box('#54875b', [0, 0.108, 0], [0.42, 0.035, 0.1])
          m.box('#54875b', [0, 0.11, 0], [0.1, 0.035, 0.42])
        },
      },
      () => onExpand(c),
    )
  if (decorating && holding) {
    const item = getCatalogItem(holding.catalogId),
      state = buildSceneState('outdoor', plots, placed, plants)
    if (item && slotFor(item)?.scene === 'outdoor')
      for (let z = 0; z < BALANCE.gridHeight; z++)
        for (let x = 0; x < BALANCE.gridWidth; x++) {
          const ok = canPlace(
            footprintOf(item, x, z),
            'outdoor',
            'ground',
            state,
            holding.kind === 'move' ? holding.id : undefined,
          )
          const over = hover?.x === x && hover?.y === z
          if (ok || over)
            add({
              key: 'slot' + x + '-' + z,
              model: over ? (ok ? 'selected' : 'blocked') : 'slot',
              x: x + 0.5,
              z: z + 0.5,
              y: 0.033,
              hit: false,
              carve: (m) => m.box(over ? (ok ? '#74bc86' : '#e79684') : '#bed49b', [0, 0, 0], [0.91, 0.028, 0.91]),
            })
        }
  }
  useEffect(() => {
    const el = canvas.current!
    const lost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    try {
      world.current = createWorld(el, setNear)
      canvasCells.set(el, world.current.cell)
    } catch {
      setFailed(true)
      return
    }
    // Trackpad pinch and mouse wheel zoom (desktop preview); iPad uses two-finger pinch below.
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      world.current?.zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)))
    }
    el.addEventListener('webglcontextlost', lost)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('webglcontextlost', lost)
      el.removeEventListener('wheel', wheel)
      canvasCells.delete(el)
      world.current?.dispose()
      world.current = null
    }
  }, [])
  useEffect(() => {
    world.current?.update(toys)
  })
  useEffect(() => {
    world.current?.lift(carded)
  }, [carded])
  const pinchState = () => {
    const [a, b] = [...fingers.current.values()]
    return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 }
  }
  function down(e: PointerEvent<HTMLCanvasElement>) {
    fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (fingers.current.size === 2 && !decorating) {
      // A second finger turns the drag into a pinch; nothing gets tapped.
      e.currentTarget.setPointerCapture(e.pointerId)
      pinch.current = pinchState()
      if (pointer.current) pointer.current.moved = true
      return
    }
    if (!e.isPrimary) return
    tapped.current = false
    const key = world.current?.pick(e.clientX, e.clientY)
    const prop = outdoors.find((p) => p.id === key)
    if (decorating && !holding && prop) {
      startPress(e, { kind: 'move', id: prop.id, catalogId: prop.catalogId }, dropAt, () =>
        useDecorate.getState().openMenu(prop.id),
      )
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    pointer.current = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false }
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    if (fingers.current.has(e.pointerId)) fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinch.current && fingers.current.size === 2) {
      const now = pinchState(),
        was = pinch.current
      world.current?.zoomBy(now.dist / was.dist)
      world.current?.pan(now.midX - was.midX, now.midY - was.midY)
      pinch.current = now
      return
    }
    const p = pointer.current
    if (!p || !e.isPrimary) return
    if (Math.hypot(p.x - e.clientX, p.y - e.clientY) > 7) p.moved = true
    if (p.moved && !decorating) world.current?.pan(e.clientX - p.lastX, e.clientY - p.lastY)
    p.lastX = e.clientX
    p.lastY = e.clientY
  }
  function lift(e: PointerEvent<HTMLCanvasElement>) {
    fingers.current.delete(e.pointerId)
    if (fingers.current.size < 2) pinch.current = null
  }
  function up(e: PointerEvent<HTMLCanvasElement>) {
    lift(e)
    if (!e.isPrimary) return
    const p = pointer.current
    pointer.current = null
    tapped.current = !!p && !p.moved
  }
  function click(e: MouseEvent<HTMLCanvasElement>) {
    if (!tapped.current) return
    tapped.current = false
    const cell = world.current?.cell(e.clientX, e.clientY)
    if (decorating && holding && cell) {
      void dropAt(cell, holding)
      return
    }
    if (decorating) return
    const key = world.current?.pick(e.clientX, e.clientY)
    if (key && actions.has(key)) {
      // Plants, beds and pits: the camera glides in to them while their card opens.
      const toy = spots.get(key)
      if (toy && key !== 'house' && !key.startsWith('expand'))
        // Look at the middle of a tree's crown, so the whole tree fits above the card.
        world.current?.focus(toy.x, toy.z, undefined, toy.model.includes('-tree3') ? 1.4 * (toy.size ?? 1) : 0.55)
      actions.get(key)!()
      return
    }
    if (cell && (pitAt(cell.x, cell.y) || plots.some((b) => b.x === cell.x && b.y === cell.y))) onPlot(cell.x, cell.y)
  }
  return (
    <div className="woodland">
      <canvas
        ref={canvas}
        aria-label="立体木作花园"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onClick={click}
        onPointerCancel={(e) => {
          lift(e)
          pointer.current = null
        }}
      />
      {failed ? (
        <div className="wood-error">
          <p>设备暂时无法显示立体花园</p>
          <button className="btn" onClick={onExit}>
            打开平面 2D
          </button>
        </div>
      ) : (
        <div className="wood-tools">
          <button onClick={() => world.current?.rotate()} aria-label="旋转九十度">
            ↻ 转向
          </button>
          <button
            aria-pressed={near}
            onClick={() => {
              world.current?.near(!near)
            }}
          >
            {near ? '⤢ 看全园' : '⊕ 看近些'}
          </button>
          <button onClick={onExit}>平面 2D</button>
        </div>
      )}
      {courage && <CourageSheet onClose={() => setCourage(false)} />}
    </div>
  )
}
