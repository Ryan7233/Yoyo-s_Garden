import * as T from 'three'
import { BALANCE } from '../../../data/balance'
import { ORCHARD_RECT } from '../../../engine/plots'
import { carvedMaterial } from './surface'
import { Carving, honey, leaf, lime, oak } from './carving'

export type Toy = {
  key: string
  model: string
  carve: (m: Carving) => void
  x: number
  z: number
  y?: number
  angle?: number
  size?: number
  fly?: boolean
  hit?: boolean
  /** Turns to face the camera, so its face is always toward the child. */
  face?: boolean
  /** 0–1: how far it hangs its head (thirsty plants). Eases, so watering makes it perk up. */
  droop?: number
  /** How much the wind moves it: 0 stands firm, about 1 for flowers, less for trees. */
  wind?: number
  /** Petals of this colour keep drifting down from its crown. */
  petals?: string
  /** Places it goes round and round between, pausing `stay` seconds at each. */
  route?: Stop[]
  /** How it gets along its route, and how fast (units per second). */
  gait?: 'fly' | 'hop' | 'walk'
  speed?: number
  /** Gives a little hop of its own every few seconds. */
  fidget?: boolean
  /** Shines by itself instead of being lit: window panes, lamp bulbs, the rainbow. */
  glow?: boolean
  /** Only there after dark. */
  night?: boolean
  /** Casts warm light of this colour around itself after dark. */
  light?: string
  /** Turns to follow the sun across the sky instead of facing the camera. */
  sunward?: boolean
  /** Stands this far behind the garden as seen from the camera (the rainbow). */
  behind?: number
}
export type Phase = 'morning' | 'afternoon' | 'evening' | 'night'
/** Light for each part of the day: sky and ground bounce, the sun (or moon), and how dark shadows are. */
const LIGHT: Record<Phase, { sky: string; ground: string; hemi: number; sun: string; power: number; shade: number }> = {
  morning: { sky: '#fff0d6', ground: '#d6c6ac', hemi: 2.05, sun: '#ffe3b4', power: 2.3, shade: 0.17 },
  afternoon: { sky: '#fff1d8', ground: '#cfbca7', hemi: 2.15, sun: '#fff3d9', power: 2.25, shade: 0.18 },
  evening: { sky: '#ffd6bd', ground: '#b9a0aa', hemi: 1.75, sun: '#ffab72', power: 2.1, shade: 0.16 },
  night: { sky: '#8ea2dc', ground: '#3c4568', hemi: 1.25, sun: '#b6c6ff', power: 0.9, shade: 0.1 },
}
function cloud(m: Carving) {
  m.ball('#ffffff', [0, 0, 0], [1.1, 0.5, 0.7])
  m.ball('#ffffff', [-0.85, -0.08, 0.1], [0.75, 0.4, 0.55])
  m.ball('#fbf7ef', [0.9, -0.1, -0.05], [0.8, 0.42, 0.6])
  m.ball('#ffffff', [0.25, 0.32, 0], [0.7, 0.45, 0.55])
  m.ball('#f4efe6', [0, -0.3, 0], [1.5, 0.22, 0.75])
}
export type Stop = { x: number; y: number; z: number; stay: number }
const hash = (key: string) => [...key].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7) / 9973
/** Where something is on its route at `time`, whether it is on the move, and which way it is heading. */
function along(route: Stop[], speed: number, time: number) {
  const legs = route.map((a, i) => {
    const b = route[(i + 1) % route.length]
    return { a, b, run: Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / speed }
  })
  let t = time % legs.reduce((sum, l) => sum + l.a.stay + l.run, 0)
  for (const { a, b, run } of legs) {
    if (t < a.stay) return { ...a, moving: false, p: 0, far: 0, heading: 0 }
    t -= a.stay
    if (t < run) {
      const p = t / run
      return {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p,
        z: a.z + (b.z - a.z) * p,
        moving: true,
        p,
        far: run * speed,
        heading: Math.atan2(b.x - a.x, b.z - a.z),
      }
    }
    t -= run
  }
  return { ...route[0], moving: false, p: 0, far: 0, heading: 0 }
}
/** How a toy answers a tap. */
export type Poke = 'wiggle' | 'hop' | 'dive'
type Anim = { kind: Poke | 'pop'; from: number }
const ANIM_MS: Record<Anim['kind'], number> = { wiggle: 900, hop: 700, dive: 1100, pop: 600 }

function wateringCan(m: Carving) {
  m.box('#6fb1b5', [0, 0.16, 0], [0.34, 0.3, 0.26])
  m.box('#8ac6c9', [0, 0.32, 0], [0.36, 0.05, 0.28])
  m.beam('#6fb1b5', [0.15, 0.12, 0], [0.42, 0.34, 0], 0.035)
  m.ball('#8ac6c9', [0.44, 0.36, 0], [0.07, 0.05, 0.07])
  m.ring('#5c9a9e', [-0.2, 0.18, 0], [0.11, 0.13, 0.11], [Math.PI / 2, 0, 0])
}
function basket(m: Carving) {
  // A woven tub: plump body, darker hollow, a rim, and a hoop handle over the top.
  m.ball('#c99a62', [0, 0.16, 0], [0.34, 0.2, 0.34])
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5
    m.ball(i % 2 ? '#b98850' : '#d6aa72', [Math.cos(a) * 0.31, 0.17, Math.sin(a) * 0.31], [0.07, 0.15, 0.07])
  }
  m.ball('#7d5836', [0, 0.3, 0], [0.28, 0.05, 0.28])
  m.ring('#a97a48', [0, 0.31, 0], [0.31, 0.31, 0.31], [Math.PI / 2, 0, 0])
  m.ring('#a97a48', [0, 0.36, 0], [0.26, 0.34, 0.26])
}
const drop = (m: Carving) => {
  m.ball('#59abcf', [0, 0, 0], [0.05, 0.06, 0.05])
  m.cone('#71c5dc', [0, 0.06, 0], [0.042, 0.09, 0.042])
}
const coin = (m: Carving) => {
  m.ball('#ffcf4a', [0, 0, 0], [0.09, 0.09, 0.03])
  m.ball('#ffe48a', [0, 0, 0.02], [0.055, 0.055, 0.02])
}
const W = BALANCE.gridWidth,
  H = BALANCE.gridHeight
const floorPlane = new T.Plane(new T.Vector3(0, 1, 0), 0)

function landscape(m: Carving) {
  m.box('#b67f52', [W / 2, -0.45, H / 2], [W + 0.65, 0.59, H + 0.65])
  m.box('#d7aa73', [W / 2, -0.22, H / 2], [W + 0.64, 0.22, H + 0.64])
  m.box('#a7bb78', [W / 2, -0.103, H / 2], [W + 0.61, 0.21, H + 0.61])
  // A thin veneer line around the curved base, and little etched grain on the timber.
  for (let i = 0; i < 32; i++) {
    const x = 0.24 + i * 0.37
    m.ball(
      i % 2 ? '#c69360' : '#cf9d6a',
      [x, -0.43 + (i % 4) * 0.027, H + 0.317],
      [0.12 + (i % 3) * 0.053, 0.012, 0.009],
    )
  }
  let state = 92
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let i = 0; i < 125; i++) {
    const x = rand() * W,
      z = rand() * H
    for (let j = 0; j < 3; j++)
      m.ball(
        j % 2 ? '#a7bd73' : '#b6c987',
        [x + j * 0.045, 0.014, z + rand() * 0.046],
        [0.033, 0.014, 0.07],
        [0, rand() * 3, 0],
      )
  }
  for (let i = 0; i < 49; i++) {
    const a = rand(),
      edge = i % 4
    const x = edge === 0 ? -0.12 : edge === 1 ? W + 0.08 : a * W
    const z = edge === 2 ? -0.12 : edge === 3 ? H + 0.08 : a * H
    for (let j = 0; j < 3; j++)
      m.ball(j % 2 ? leaf : lime, [x + j * 0.043, 0.084, z], [0.036, 0.11, 0.028], [0, 0, (j - 1) * 0.47])
    if (i % 3 === 0) {
      for (let j = 0; j < 5; j++) {
        const a = (j * Math.PI * 2) / 5
        m.ball(
          i % 2 ? '#fff1cc' : '#f3c6bf',
          [x + 0.069 * Math.cos(a), 0.17, z + 0.069 * Math.sin(a)],
          [0.058, 0.031, 0.055],
        )
      }
      m.ball('#eab654', [x, 0.195, z], [0.046, 0.027, 0.046])
    }
  }
  for (let i = 0; i < 5; i++)
    m.ball(
      i % 2 ? '#d9c7a5' : '#dfceb0',
      [1.48 + 0.14 * Math.sin(i), 0.037, 2.9 + i * 0.245],
      [0.28, 0.05, 0.133],
      [0, i * 0.44, 0],
    )
}
/** The orchard: a low picket fence round the right-hand strip, with a gap and a little sign facing the beds. */
export function orchardYard(m: Carving, gateZ = ORCHARD_RECT.y + ORCHARD_RECT.h / 2) {
  const { x: x0, y: z0, w, h } = ORCHARD_RECT
  const x1 = x0 + w,
    z1 = z0 + h
  const post = (x: number, z: number) => {
    m.box(honey, [x, 0.2, z], [0.09, 0.4, 0.09])
    m.cone('#c88a55', [x, 0.44, z], [0.075, 0.09, 0.075], [0, Math.PI / 4, 0])
  }
  const rail = (a: [number, number], b: [number, number]) => {
    for (const y of [0.16, 0.31]) m.beam('#c48f5c', [a[0], y, a[1]], [b[0], y, b[1]], 0.026)
    const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5)
    for (let i = 0; i <= n; i++) post(a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n)
  }
  const inset = 0.08
  rail([x0 + inset, z0 + inset], [x1 - inset, z0 + inset])
  rail([x1 - inset, z0 + inset], [x1 - inset, z1 - inset])
  rail([x1 - inset, z1 - inset], [x0 + inset, z1 - inset])
  // The side facing the beds has a gate gap in the middle.
  if (z1 - inset - (gateZ + 0.7) > 0.3) rail([x0 + inset, z1 - inset], [x0 + inset, gateZ + 0.7])
  if (gateZ - 0.7 - (z0 + inset) > 0.3) rail([x0 + inset, gateZ - 0.7], [x0 + inset, z0 + inset])
  // Tall gateposts with a beam across: the name board hangs under it.
  for (const s of [-0.7, 0.7]) m.beam(oak, [x0 + inset, 0, gateZ + s], [x0 + inset, 1.5, gateZ + s], 0.06)
  m.beam(honey, [x0 + inset, 1.5, gateZ - 0.85], [x0 + inset, 1.5, gateZ + 0.85], 0.055)
  for (let i = 0; i < 3; i++)
    m.ball(['#d9473f', '#f39a2e', '#f0767c'][i], [x0 + inset, 1.6, gateZ - 0.3 + i * 0.3], [0.09, 0.09, 0.09])
}

/** A rainbow for a day when every must-do task is done: six bands arching over the whole garden. */
export function rainbow(m: Carving) {
  ;['#f2797d', '#f7a85b', '#f9dc6b', '#8fd08b', '#7fbde8', '#b59be0'].forEach((c, i) => m.arc(c, 8.6 - i * 0.34, 0.2, [0, 0, 0]))
}

/** A round planting pit in the grass: soft soil inside a ring of little stones. */
export function pit(m: Carving) {
  m.ball('#8f603d', [0, 0.01, 0], [0.7, 0.05, 0.7])
  m.ball('#a27049', [0, 0.035, 0], [0.56, 0.03, 0.56])
  for (let i = 0; i < 14; i++) {
    const a = (i * Math.PI * 2) / 14
    m.ball(i % 2 ? '#cfc6ae' : '#b9b29b', [Math.cos(a) * 0.72, 0.04, Math.sin(a) * 0.72], [0.12, 0.07, 0.1], [0, -a, 0])
  }
}

export function bed(m: Carving) {
  m.box('#a47550', [0, 0.066, 0], [0.98, 0.13, 0.98])
  m.box('#805338', [0, 0.137, 0], [0.86, 0.12, 0.86])
  for (let i = 0; i < 24; i++) {
    const x = 0.69 * (Math.sin(i * 25.17) * 0.5),
      z = 0.68 * (Math.cos(i * 17.47) * 0.5)
    m.ball(
      ['#865735', '#916443', '#795236'][i % 3],
      [x, 0.193, z],
      [0.04 + (i % 4) * 0.016, 0.023 + (i % 3) * 0.009, 0.051 + (i % 3) * 0.013],
    )
  }
  for (const side of [-1, 1]) {
    m.box(honey, [side * 0.452, 0.135, 0], [0.081, 0.13, 0.954])
    m.box('#ddb17d', [0, 0.147, side * 0.448], [0.84, 0.14, 0.079])
    for (const s of [-1, 1]) m.ball('#8b6d4e', [s * 0.391, 0.218, side * 0.447], [0.019, 0.008, 0.019])
  }
}

/** How close the camera may come: 1 shows the whole garden, MAX_ZOOM fills the screen with about one tree. */
export const MAX_ZOOM = 3.4
export const NEAR_ZOOM = 2.3
/** Opening view: a little closer than the whole board, so plants read at a glance. */
export const START_ZOOM = 1.3

export function createWorld(canvas: HTMLCanvasElement, onZoom?: (zoomedIn: boolean) => void) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap
  const scene = new T.Scene()
  const camera = new T.OrthographicCamera(-8, 8, 6, -6, 0.1, 100)
  const hemi = new T.HemisphereLight('#fff1d8', '#cfbca7', 2.15)
  scene.add(hemi)
  const sun = new T.DirectionalLight('#fff3d9', 2.25)
  sun.position.set(-2, 13, 9)
  sun.target.position.set(6, 0, 4)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 0.1, far: 40 })
  sun.shadow.normalBias = 0.025
  sun.shadow.bias = -0.0004
  scene.add(sun, sun.target)
  const { material: mat, noise, wind } = carvedMaterial()
  /** For things that shine with their own light. */
  const glowMat = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })
  /** Clouds are soft and plain, not carved wood. */
  const cloudMat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#9fb4d8', emissiveIntensity: 0.35 })
  let night = false,
    sunTurn = 0.5,
    lit = 0
  /** Lamps and lit windows: toy key → its light. */
  const lamps = new Map<string, T.PointLight>()
  /** Wooden signs with writing on them. */
  const labels = new Map<string, { mesh: T.Mesh<T.PlaneGeometry, T.MeshStandardMaterial>; text: string }>()
  const cache = new Map<string, T.BufferGeometry>()
  const objects = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>>()
  const ray = new T.Raycaster()
  const shadow = new T.Mesh(new T.PlaneGeometry(240, 240), new T.ShadowMaterial({ opacity: 0.18 }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -0.75
  shadow.receiveShadow = true
  scene.add(shadow)
  const fixed: Toy = { key: 'land', model: 'land', carve: landscape, x: 0, z: 0, hit: false }
  let yaw = 0.54,
    destYaw = 0.54,
    /** How steeply the camera looks down, in radians: low is nearly side-on, high is nearly straight down. */
    elev = 0.7,
    destElev = 0.7,
    zoom = START_ZOOM,
    destZoom = START_ZOOM,
    zoomedIn = true,
    /** 1 while a card covers the bottom of the screen: the focused spot sits in the upper part instead. */
    raise = 0,
    destRaise = 0,
    frame = 0,
    last = 0
  let focusX = W / 2,
    focusZ = H / 2,
    destX = focusX,
    destZ = focusZ,
    /** Height the camera looks at: the ground normally, mid-crown when a tree is in focus. */
    focusY = 0.55,
    destY = 0.55
  const clampFocus = () => {
    // Zoomed out the garden stays centred; zoomed in the view may wander anywhere over the board.
    const t = T.MathUtils.clamp((destZoom - 1) / 0.6, 0, 1)
    destX = T.MathUtils.lerp(W / 2, T.MathUtils.clamp(destX, 0, W), t)
    destZ = T.MathUtils.lerp(H / 2, T.MathUtils.clamp(destZ, 0, H), t)
  }
  const setZoom = (next: number) => {
    destZoom = T.MathUtils.clamp(next, 1, MAX_ZOOM)
    clampFocus()
    const now = destZoom > 1.05
    if (now !== zoomedIn) onZoom?.((zoomedIn = now))
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const update = (rows: Toy[]) => {
    const keys = new Set(['land', ...rows.map((t) => t.key)])
    for (const [key, obj] of objects)
      if (!keys.has(key)) {
        scene.remove(obj)
        objects.delete(key)
      }
    for (const t of [fixed, ...rows]) {
      let geo = cache.get(t.model)
      if (!geo) {
        const m = new Carving()
        t.carve(m)
        geo = m.finish()
        // Every copy of a model sways the same amount, so it is stored with the shape.
        const n = geo.getAttribute('position').count
        geo.setAttribute('sway', new T.BufferAttribute(new Float32Array(n).fill(t.wind ?? 0), 1))
        cache.set(t.model, geo)
      }
      let obj = objects.get(t.key)
      const fresh = !obj
      if (!obj) {
        obj = new T.Mesh(geo, t.glow ? (glowMat as unknown as T.MeshStandardMaterial) : mat)
        obj.castShadow = !t.glow
        obj.receiveShadow = !t.glow
        obj.rotation.order = 'YXZ'
        scene.add(obj)
        objects.set(t.key, obj)
      }
      if (obj.geometry !== geo) {
        // While water is still falling the plant keeps its old shape; then it changes with a pop.
        const wait = (holds.get(t.key) ?? 0) - performance.now()
        if (!fresh && wait > 0) pending.set(t.key, geo)
        else {
          obj.geometry = geo
          if (!fresh && t.face && !reduced) anims.set(t.key, { kind: 'pop', from: performance.now() })
        }
      }
      obj.userData = {
        ...t,
        hit: t.hit !== false,
        droopNow: obj.userData.droopNow ?? t.droop ?? 0,
        turn: obj.userData.turn ?? t.angle ?? 0,
      }
      if (t.petals && !drifts.has(t.key) && !reduced)
        drifts.set(
          t.key,
          Array.from({ length: 5 }, () =>
            prop('petal' + t.petals, (m) => m.ball(t.petals!, [0, 0, 0], [0.07, 0.012, 0.05]), scene),
          ),
        )
    }
    for (const t of rows)
      if (t.light && !lamps.has(t.key)) {
        const lamp = new T.PointLight(t.light, lit, 5.5, 1.6)
        lamp.position.set(t.x, (t.y ?? 0) + 1.3, t.z + 0.3)
        scene.add(lamp)
        lamps.set(t.key, lamp)
      }
    for (const [key, lamp] of lamps)
      if (!rows.some((t) => t.key === key && t.light)) {
        scene.remove(lamp)
        lamps.delete(key)
      }
    for (const [key, petals] of drifts)
      if (!rows.some((t) => t.key === key && t.petals)) {
        for (const p of petals) scene.remove(p)
        drifts.delete(key)
      }
  }
  // Effects are drawn in their own pass over the finished garden, so a tree in front never hides them.
  const stage = new T.Scene()
  stage.add(new T.HemisphereLight('#fff1d8', '#cfbca7', 2.15))
  const stageSun = new T.DirectionalLight('#fff3d9', 2.25)
  stageSun.position.set(-2, 13, 9)
  stage.add(stageSun)
  renderer.autoClear = false
  /** Petals drifting down from blossoming trees: tree key → its petals. */
  const drifts = new Map<string, T.Mesh[]>()
  const anims = new Map<string, Anim>()
  /** Plants whose new shape waits for the watering to finish: key → time to swap. */
  const holds = new Map<string, number>()
  const pending = new Map<string, T.BufferGeometry>()
  /** Short-lived things flying about: water drops, fruit on its way to the basket, coins. */
  let effects: ((at: number) => boolean)[] = []
  const ease = (p: number) => 1 - (1 - p) ** 3
  /** A temporary carved thing (watering can, basket, a flying fruit) that is not one of the garden's toys. */
  const prop = (model: string, carve: (m: Carving) => void, into: T.Scene = stage, material: T.Material = mat) => {
    let geo = cache.get(model)
    if (!geo) {
      const m = new Carving()
      carve(m)
      cache.set(model, (geo = m.finish()))
    }
    const mesh = new T.Mesh(geo, material)
    mesh.rotation.order = 'YXZ'
    into.add(mesh)
    return mesh
  }
  // The garden floats in the sky: wooden clouds drift slowly round it, some above, some below.
  const clouds = reduced
    ? []
    : Array.from({ length: 9 }, (_, i) => {
        const c = prop('cloud', cloud, scene, cloudMat)
        c.scale.setScalar(0.9 + (i % 4) * 0.35)
        return c
      })
  const fireflies = reduced
    ? []
    : Array.from({ length: 16 }, () => prop('firefly', (m) => m.ball('#fff3a0', [0, 0, 0], [0.055, 0.055, 0.055]), scene, glowMat))
  /** Scale that pops in over the first `inMs` and shrinks away over the last 160 ms of `life`. */
  const blip = (t: number, life: number, inMs = 180) =>
    t < inMs ? ease(t / inMs) * 1.12 - 0.12 * ease(t / inMs) ** 2 : t > life - 160 ? Math.max(0, (life - t) / 160) : 1
  /** Runs `step` with the milliseconds since `from` until `life` is over, then clears the meshes away. */
  const play = (from: number, life: number, meshes: T.Mesh[], step: (t: number) => void) => {
    for (const m of meshes) m.visible = false
    effects.push((at) => {
      const t = at - from
      if (t >= life) {
        for (const m of meshes) stage.remove(m)
        return false
      }
      if (t >= 0) step(t)
      return true
    })
  }
  /** Toward the camera and to its right, flat on the ground: where helpers stand so the plant stays in view. */
  const beside = (right: number, toward: number): [number, number] => [
    Math.cos(yaw) * right + Math.sin(yaw) * toward,
    -Math.sin(yaw) * right + Math.cos(yaw) * toward,
  ]
  /** The watering can flies in over a plant, tips, and drops of water fall onto it. */
  function water(x: number, z: number, top: number) {
    if (reduced) return
    const now = performance.now(),
      can = prop('fx-can', wateringCan),
      drops = Array.from({ length: 7 }, () => prop('fx-drop', drop))
    const [dx, dz] = beside(-0.42, 0.1)
    const life = 1250
    play(now, life, [can, ...drops], (t) => {
      const tip = T.MathUtils.clamp((t - 150) / 250, 0, 1) - T.MathUtils.clamp((t - 950) / 200, 0, 1)
      can.visible = true
      can.position.set(x + dx, top + 0.42 + 0.12 * (1 - ease(Math.min(1, t / 200))), z + dz)
      can.rotation.set(0, yaw, -0.75 * ease(tip))
      can.scale.setScalar(blip(t, life) * 1.35)
      drops.forEach((d, i) => {
        const p = (t - 330 - i * 75) / 420
        d.visible = p > 0 && p < 1
        if (!d.visible) return
        const spread = beside(((i % 3) - 1) * 0.09, ((i % 2) - 0.5) * 0.1)
        d.position.set(x + spread[0], top + 0.4 - (top + 0.3) * p * p, z + spread[1])
        d.scale.setScalar(1.5 - 0.5 * p)
      })
    })
  }
  /** Fruit (or flower heads) jump off the plant one by one into a basket, then coins spring out of it. */
  function harvest(x: number, z: number, top: number, color: string, count: number) {
    if (reduced) return
    const now = performance.now(),
      tub = prop('fx-basket', basket),
      fruit = Array.from({ length: count }, () =>
        prop('fx-fruit' + color, (m) => {
          m.ball(color, [0, 0, 0], [0.15, 0.15, 0.15])
          m.ball('#ffffff', [-0.05, 0.055, 0.115], [0.035, 0.035, 0.02])
        }),
      ),
      coins = Array.from({ length: 4 }, () => prop('fx-coin', coin))
    const [bx, bz] = beside(0.72, 0.5),
      landed = 250 + count * 110 + 430,
      life = landed + 900
    play(now, life, [tub, ...fruit, ...coins], (t) => {
      tub.visible = true
      tub.position.set(x + bx, 0.02, z + bz)
      // The basket gives a little squash each time something lands in it.
      const since = (t - 680) % 110,
        thud = t > 680 && t < landed + 80 ? 0.1 * Math.exp(-Math.max(0, since) / 40) : 0
      const s = blip(t, life)
      tub.scale.set(s * (1 + thud), s * (1 - thud), s * (1 + thud))
      fruit.forEach((f, i) => {
        const p = (t - 250 - i * 110) / 430
        f.visible = p > 0 && p < 1
        if (!f.visible) return
        const a = i * 2.4,
          r = 0.32 + (i % 3) * 0.08
        const sx = x + Math.sin(a) * r,
          sz = z + Math.cos(a) * r,
          sy = top * (0.62 + (i % 3) * 0.12)
        f.position.set(sx + (x + bx - sx) * p, sy + (0.32 - sy) * p + 0.9 * Math.sin(Math.PI * p), sz + (z + bz - sz) * p)
        f.rotation.set(p * 5, 0, p * 3)
        f.scale.setScalar(p < 0.15 ? 0.6 + (p / 0.15) * 0.5 : 1.1 - 0.25 * p)
      })
      coins.forEach((c, i) => {
        const p = (t - landed - i * 70) / 620
        c.visible = p > 0 && p < 1
        if (!c.visible) return
        const side = beside((i - 1.5) * 0.34 * p, 0)
        c.position.set(x + bx + side[0], 0.4 + 1.5 * ease(p) - 0.35 * p * p, z + bz + side[1])
        c.rotation.set(0, yaw + p * 9, 0)
        c.scale.setScalar(p < 0.8 ? 1.7 : 1.7 * (1 - (p - 0.8) / 0.2))
      })
    })
  }
  /** Put one toy where it belongs this frame: its resting pose, plus whatever it is doing. */
  const pose = (o: T.Mesh, at: number, weight: number) => {
    const u = o.userData as Toy & { droopNow: number; turn: number }
    const time = at / 1000 + hash(u.key) * 40
    let x = u.x,
      y = u.y ?? 0,
      z = u.z,
      ry = u.sunward ? sunTurn : u.face ? yaw + (u.angle ?? 0) * 0.3 : (u.angle ?? 0),
      rz = 0,
      wide = 1,
      tall = 1
    u.droopNow += ((u.droop ?? 0) - u.droopNow) * weight
    if (u.route && u.route.length > 1 && !reduced) {
      // Out and about: flying between flowers, hopping to a snack, walking the paths.
      const w = along(u.route, u.speed ?? 1, time)
      x = w.x
      y = w.y
      z = w.z
      // On the move it looks where it is going; at a stop it turns back to the child.
      let want = w.moving ? w.heading : yaw
      want = u.turn + Math.atan2(Math.sin(want - u.turn), Math.cos(want - u.turn))
      u.turn += (want - u.turn) * Math.min(1, weight * 1.4)
      ry = u.turn
      if (u.gait === 'fly') {
        y += Math.sin(time * 5) * 0.05 + (w.moving ? Math.sin(Math.PI * w.p) * 0.25 : 0)
        rz = Math.sin(time * 9) * 0.1
      } else if (w.moving) {
        const steps = Math.max(1, Math.round(w.far / (u.gait === 'hop' ? 0.5 : 0.28)))
        const beat = Math.abs(Math.sin(Math.PI * w.p * steps))
        y += beat * (u.gait === 'hop' ? 0.2 : 0.045)
        tall *= 1 + beat * (u.gait === 'hop' ? 0.12 : 0.04)
        if (u.gait === 'walk') rz = Math.sin(Math.PI * w.p * steps * 2) * 0.07
      }
    } else if (u.fly && !reduced) {
      const phase = at * 0.0015 + u.x
      x += Math.cos(phase) * 0.19
      y += Math.sin(phase * 2) * 0.085
      z += Math.sin(phase) * 0.14
      rz = Math.sin(phase * 2) * 0.13
    }
    if (u.fidget && !reduced) {
      // Every few seconds, a little hop for no reason at all.
      const beat = time % (5 + hash(u.key) * 4)
      if (beat < 0.5) y += 0.2 * Math.sin((Math.PI * beat) / 0.5)
    }
    const a = anims.get(u.key)
    if (a) {
      const t = (at - a.from) / 1000,
        p = Math.min(1, (at - a.from) / ANIM_MS[a.kind])
      if (a.kind === 'wiggle') {
        rz += 0.3 * Math.sin(t * 19) * Math.exp(-t * 4.2)
        tall *= 1 + 0.16 * Math.sin(t * 15 + 1.6) * Math.exp(-t * 6)
        wide *= 1 - 0.08 * Math.sin(t * 15 + 1.6) * Math.exp(-t * 6)
      } else if (a.kind === 'hop') {
        y += 0.5 * Math.sin(Math.PI * p)
        ry += Math.PI * 2 * ease(p)
        tall *= 1 + 0.18 * Math.sin(Math.PI * p)
      } else if (a.kind === 'dive') {
        // Down under the water and back up with a little bob.
        y -= 0.3 * Math.sin(Math.PI * Math.min(1, p * 1.4)) - (p > 0.72 ? 0.12 * Math.sin((p - 0.72) * 11) : 0)
        tall *= 1 - 0.3 * Math.sin(Math.PI * Math.min(1, p * 1.4))
      } else {
        const s = p < 0.3 ? 0.7 + 0.5 * ease(p / 0.3) : 1.2 - 0.2 * ease((p - 0.3) / 0.7)
        tall *= s
        wide *= 2 - s > 1.25 ? 1.25 : 2 - s
      }
      if (p >= 1) anims.delete(u.key)
    }
    const size = u.size ?? 1
    if (u.behind) {
      x -= Math.sin(yaw) * u.behind
      z -= Math.cos(yaw) * u.behind
    }
    o.visible = !u.night || night
    o.position.set(x, y, z)
    o.rotation.set(u.droopNow * 0.42, ry, rz)
    o.scale.set(size * wide, size * tall * (1 - 0.06 * u.droopNow), size * wide)
  }
  const resize = () => {
    renderer.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1, false)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  const layout = () => {
    const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1),
      sin = Math.abs(Math.sin(yaw)),
      cos = Math.abs(Math.cos(yaw))
    const horizontal = (W + 0.9) * cos + (H + 0.9) * sin
    const vertical = ((W + 0.8) * sin + (H + 0.8) * cos) * Math.sin(elev) + 2.15
    const height = Math.max(vertical * 1.11, (horizontal / aspect) * 1.08) / zoom
    camera.top = height * (0.5 - 0.12 * raise)
    camera.bottom = -height * (0.5 + 0.12 * raise)
    camera.right = (height * aspect) / 2
    camera.left = -camera.right
    const target = new T.Vector3(focusX, focusY, focusZ)
    camera.position
      .copy(target)
      .add(
        new T.Vector3(Math.sin(yaw) * Math.cos(elev), Math.sin(elev), Math.cos(yaw) * Math.cos(elev)).multiplyScalar(
          25,
        ),
      )
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }
  const draw = (at: number) => {
    frame = requestAnimationFrame(draw)
    if (document.hidden || at - last < 15) return
    const dt = Math.min(0.2, (at - last) / 1000)
    last = at
    const weight = reduced ? 1 : 1 - Math.exp(-dt * 10)
    yaw += (destYaw - yaw) * weight
    elev += (destElev - elev) * weight
    zoom += (destZoom - zoom) * weight
    raise += (destRaise - raise) * weight
    focusY += (destY - focusY) * weight
    focusX += (destX - focusX) * weight
    focusZ += (destZ - focusZ) * weight
    for (const [key, when] of holds)
      if (performance.now() >= when) {
        holds.delete(key)
        const geo = pending.get(key),
          obj = objects.get(key)
        pending.delete(key)
        // Grown or not, a freshly watered plant gives a happy little pop.
        if (obj) {
          if (geo) obj.geometry = geo
          if (!reduced) anims.set(key, { kind: 'pop', from: at })
        }
      }
    wind.value = reduced ? 0 : at / 1000
    clouds.forEach((c, i) => {
      const a = i * 0.7 + (at / 90000) * (i % 2 ? 1 : -0.7),
        far = 11.5 + (i % 3) * 2.2
      c.position.set(W / 2 + Math.cos(a) * far * 1.25, [-2.2, 3.4, -1.2, 4.6, -3][i % 5] + Math.sin(at / 4000 + i) * 0.15, H / 2 + Math.sin(a) * far)
      c.rotation.y = a
    })
    fireflies.forEach((f, i) => {
      f.visible = night
      if (!night) return
      const t = at / 1000 + i * 3.1
      f.position.set(
        ((i * 2.9) % W) + Math.sin(t * 0.5 + i) * 0.7,
        0.5 + (i % 4) * 0.35 + Math.sin(t * 0.8) * 0.25,
        ((i * 1.7) % H) + Math.cos(t * 0.4 + i * 2) * 0.7,
      )
      // They wink on and off, each in its own time.
      f.scale.setScalar(Math.max(0, Math.sin(t * 1.6)) ** 2 * 1.3)
    })
    for (const { mesh } of labels.values()) mesh.rotation.y = yaw
    for (const o of objects.values()) pose(o, at, weight)
    for (const [key, petals] of drifts) {
      const u = objects.get(key)?.userData as Toy | undefined
      if (!u) continue
      const size = u.size ?? 1
      petals.forEach((p, i) => {
        const fall = (at / 5200 + i / petals.length + hash(key)) % 1,
          a = i * 2.4 + Math.floor(at / 5200 + i / petals.length) * 1.7
        const high = (u.y ?? 0) + 1.75 * size,
          down = Math.min(1, fall / 0.8)
        p.position.set(
          u.x + Math.sin(a) * 0.55 * size + Math.sin(at / 700 + i) * 0.22 * down,
          high - (high - 0.03) * down ** 1.3,
          u.z + Math.cos(a) * 0.55 * size + Math.cos(at / 900 + i) * 0.16 * down,
        )
        p.rotation.set(down < 1 ? at / 300 + i : 0, a, down < 1 ? at / 420 : 0)
        // It rests on the grass for a moment, then fades away as the next one starts.
        p.scale.setScalar(fall < 0.06 ? fall / 0.06 : fall > 0.9 ? (1 - fall) / 0.1 : 1)
      })
    }
    effects = effects.filter((run) => run(at))
    layout()
    renderer.clear()
    renderer.render(scene, camera)
    if (stage.children.length > 2) {
      renderer.clearDepth()
      renderer.render(stage, camera)
    }
  }
  frame = requestAnimationFrame(draw)
  onZoom?.(zoomedIn)
  function aim(x: number, y: number) {
    const rect = canvas.getBoundingClientRect()
    ray.setFromCamera(
      new T.Vector2((2 * (x - rect.left)) / rect.width - 1, 1 - (2 * (y - rect.top)) / rect.height),
      camera,
    )
  }
  return {
    update,
    water,
    harvest,
    /** The time of day by the clock: moves the sun, changes the light, and after dark turns the lamps on. */
    setHour(hour: number, phase: Phase) {
      const l = LIGHT[phase]
      night = phase === 'night'
      hemi.color.set(l.sky)
      hemi.groundColor.set(l.ground)
      hemi.intensity = l.hemi
      sun.color.set(l.sun)
      sun.intensity = l.power
      // In the sky there is no table for the island to cast a shadow on.
      shadow.visible = false
      cloudMat.emissiveIntensity = night ? 0.12 : 0.35
      // East in the morning, high at noon, west by evening; at night the moon stands in for it.
      const a = night ? 2.2 : (T.MathUtils.clamp(hour, 6, 19) - 6) / 13 * Math.PI
      sun.position.set(8 + Math.cos(a) * 11, 5 + Math.sin(a) * 9, 4 + 8)
      sunTurn = Math.atan2(Math.cos(a) * 11, 8)
      for (const lamp of lamps.values()) lamp.intensity = night ? 9 : 0
      lit = night ? 9 : 0
    },
    /** Put up (or rewrite) a little wooden sign that always turns to face the reader. */
    label(key: string, text: string, x: number, y: number, z: number) {
      const old = labels.get(key)
      if (old?.text === text) return void old.mesh.position.set(x, y, z)
      if (old) {
        scene.remove(old.mesh)
        old.mesh.material.map?.dispose()
        old.mesh.material.dispose()
        old.mesh.geometry.dispose()
      }
      const board = document.createElement('canvas')
      const paint = () => {
        const pen = board.getContext('2d')!
        const font = '600 72px "ZCOOL KuaiLe", "PingFang SC", sans-serif'
        pen.font = font
        board.width = Math.ceil(pen.measureText(text).width) + 110
        board.height = 150
        pen.font = font
        pen.fillStyle = '#f4d7a4'
        pen.strokeStyle = '#8a623c'
        pen.lineWidth = 10
        pen.beginPath()
        pen.roundRect(8, 8, board.width - 16, board.height - 16, 34)
        pen.fill()
        pen.stroke()
        pen.fillStyle = '#5b3d28'
        pen.textAlign = 'center'
        pen.textBaseline = 'middle'
        pen.fillText(text, board.width / 2, board.height / 2 + 4)
      }
      paint()
      const map = new T.CanvasTexture(board)
      map.colorSpace = T.SRGBColorSpace
      const tall = 0.5
      const mesh = new T.Mesh(
        new T.PlaneGeometry((tall * board.width) / board.height, tall),
        new T.MeshStandardMaterial({ map, transparent: true, roughness: 0.9, side: T.DoubleSide }),
      )
      mesh.position.set(x, y, z)
      scene.add(mesh)
      labels.set(key, { mesh, text })
      // The handwriting font may still be loading the first time; redraw once it is there.
      void document.fonts?.load('72px "ZCOOL KuaiLe"').then(() => {
        if (labels.get(key)?.mesh !== mesh) return
        const before = board.width
        paint()
        if (board.width !== before) {
          mesh.geometry.dispose()
          mesh.geometry = new T.PlaneGeometry((tall * board.width) / board.height, tall)
        }
        map.needsUpdate = true
      })
    },
    /** A tap: the toy answers with a wiggle, a hop or a dive. */
    poke(key: string, kind: Poke = 'wiggle') {
      if (!reduced && objects.has(key)) anims.set(key, { kind, from: performance.now() })
    },
    /** Keep a plant's old shape for a moment (while it is being watered), then swap with a pop. */
    hold(key: string, ms: number) {
      holds.set(key, performance.now() + ms)
    },
    rotate() {
      // The button still gives a clean quarter turn, from wherever the garden was dragged to.
      destYaw = 0.54 + (Math.floor((destYaw - 0.54) / (Math.PI / 2) + 0.05) + 1) * (Math.PI / 2)
      destElev = 0.7
    },
    /** One finger dragging: turn the garden any way round, and tilt between side-on and bird's-eye. */
    orbit(dx: number, dy: number) {
      destYaw -= dx * 0.007
      destElev = T.MathUtils.clamp(destElev + dy * 0.005, 0.2, 1.35)
      // Follow the finger directly; the easing is only for the button and for letting go.
      yaw += (destYaw - yaw) * 0.6
      elev += (destElev - elev) * 0.6
    },
    near(next: boolean) {
      destRaise = 0
      destY = 0.55
      setZoom(next ? NEAR_ZOOM : 1)
    },
    /** Lower cards come and go: lift the focused spot above them, or settle back. */
    lift(on: boolean) {
      destRaise = on ? 1 : 0
    },
    /** Pinch or wheel: multiply the zoom. */
    zoomBy(factor: number) {
      setZoom(destZoom * factor)
    },
    /** Glide over to a spot on the board and come in close, e.g. when a tree is tapped. */
    focus(x: number, z: number, at = NEAR_ZOOM, y = 0.55) {
      destX = x
      destZ = z
      destY = y
      setZoom(Math.max(destZoom, at))
    },
    pan(dx: number, dy: number) {
      if (destZoom <= 1.05) return
      const unit = (camera.top - camera.bottom) / (canvas.clientHeight || 1)
      destX -= dx * unit * Math.cos(yaw) + (dy * unit * Math.sin(yaw)) / Math.sin(elev)
      destZ += dx * unit * Math.sin(yaw) - (dy * unit * Math.cos(yaw)) / Math.sin(elev)
      clampFocus()
      focusX = destX
      focusZ = destZ
    },
    pick(x: number, y: number) {
      aim(x, y)
      return ray.intersectObjects(
        [...objects.values()].filter((o) => o.userData.hit),
        false,
      )[0]?.object.userData.key as string | undefined
    },
    cell(x: number, y: number) {
      aim(x, y)
      const p = ray.ray.intersectPlane(floorPlane, new T.Vector3())
      if (!p || p.x < 0 || p.z < 0 || p.x >= W || p.z >= H) return null
      return { scene: 'outdoor' as const, layer: 'ground' as const, x: Math.floor(p.x), y: Math.floor(p.z) }
    },
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      for (const g of cache.values()) g.dispose()
      noise.dispose()
      mat.dispose()
      glowMat.dispose()
      cloudMat.dispose()
      for (const { mesh } of labels.values()) {
        mesh.material.map?.dispose()
        mesh.material.dispose()
        mesh.geometry.dispose()
      }
      shadow.geometry.dispose()
      shadow.material.dispose()
      sun.shadow.dispose()
      renderer.dispose()
    },
  }
}
