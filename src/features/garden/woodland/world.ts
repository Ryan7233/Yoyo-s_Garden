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
export function orchardYard(m: Carving) {
  const { x: x0, y: z0, w, h } = ORCHARD_RECT
  const x1 = x0 + w,
    z1 = z0 + h,
    gateZ = z0 + h / 2
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
  rail([x0 + inset, z1 - inset], [x0 + inset, gateZ + 0.7])
  rail([x0 + inset, gateZ - 0.7], [x0 + inset, z0 + inset])
  m.beam(oak, [x0 - 0.15, 0, gateZ - 0.9], [x0 - 0.15, 0.78, gateZ - 0.9], 0.04)
  m.box('#f2d29e', [x0 - 0.19, 0.74, gateZ - 0.9], [0.06, 0.3, 0.62])
  for (let i = 0; i < 3; i++) m.ball(['#d9473f', '#f39a2e', '#f0767c'][i], [x0 - 0.235, 0.74, gateZ - 1.07 + i * 0.17], [0.012, 0.06, 0.06])
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
  const { material: mat, noise } = carvedMaterial()
  const cache = new Map<string, T.BufferGeometry>()
  const objects = new Map<string, T.Mesh<T.BufferGeometry, T.MeshStandardMaterial>>()
  const ray = new T.Raycaster()
  const shadow = new T.Mesh(new T.PlaneGeometry(240, 240), new T.ShadowMaterial({ opacity: 0.18 }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -0.75
  shadow.receiveShadow = true
  scene.add(shadow)
  const fixed: Toy = { key: 'land', model: 'land', carve: landscape, x: 0, z: 0, hit: false }
  let toys: Toy[] = [],
    yaw = 0.54,
    destYaw = 0.54,
    zoom = START_ZOOM,
    destZoom = START_ZOOM,
    zoomedIn = true,
    /** 1 while a card covers the bottom of the screen: the focused spot sits in the upper part instead. */
    raise = 0,
    destRaise = 0,
    frame = 0,
    last = 0,
    dirty = true
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
    dirty = true
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const update = (rows: Toy[]) => {
    toys = rows
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
        cache.set(t.model, geo)
      }
      let obj = objects.get(t.key)
      if (!obj) {
        obj = new T.Mesh(geo, mat)
        obj.castShadow = true
        obj.receiveShadow = true
        scene.add(obj)
        objects.set(t.key, obj)
      }
      obj.geometry = geo
      obj.position.set(t.x, t.y ?? 0, t.z)
      obj.rotation.y = t.angle ?? 0
      obj.scale.setScalar(t.size ?? 1)
      obj.userData = { key: t.key, hit: t.hit !== false }
    }
    dirty = true
  }
  const resize = () => {
    renderer.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1, false)
    dirty = true
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  const layout = () => {
    const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1),
      sin = Math.abs(Math.sin(yaw)),
      cos = Math.abs(Math.cos(yaw))
    const elev = 0.7
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
    if (document.hidden || at - last < 32) return
    const animating =
      Math.abs(destYaw - yaw) > 0.002 ||
      Math.abs(destZoom - zoom) > 0.002 ||
      Math.abs(destRaise - raise) > 0.002 ||
      Math.abs(destY - focusY) > 0.002 ||
      Math.abs(destX - focusX) > 0.002 ||
      Math.abs(destZ - focusZ) > 0.002
    const flies = !reduced && toys.some((t) => t.fly)
    if (!dirty && !animating && !flies) return
    const dt = Math.min(0.2, (at - last) / 1000)
    last = at
    const weight = reduced ? 1 : 1 - Math.exp(-dt * 10)
    yaw += (destYaw - yaw) * weight
    zoom += (destZoom - zoom) * weight
    raise += (destRaise - raise) * weight
    focusY += (destY - focusY) * weight
    focusX += (destX - focusX) * weight
    focusZ += (destZ - focusZ) * weight
    if (flies)
      for (const t of toys)
        if (t.fly) {
          const o = objects.get(t.key)!,
            phase = at * 0.0015 + t.x
          o.position.set(
            t.x + Math.cos(phase) * 0.19,
            (t.y ?? 0) + Math.sin(phase * 2) * 0.085,
            t.z + Math.sin(phase) * 0.14,
          )
          o.rotation.z = Math.sin(phase * 2) * 0.13
        }
    layout()
    renderer.render(scene, camera)
    dirty = false
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
    rotate() {
      destYaw += Math.PI / 2
      dirty = true
    },
    near(next: boolean) {
      destRaise = 0
      destY = 0.55
      setZoom(next ? NEAR_ZOOM : 1)
    },
    /** Lower cards come and go: lift the focused spot above them, or settle back. */
    lift(on: boolean) {
      destRaise = on ? 1 : 0
      dirty = true
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
      destX -= dx * unit * Math.cos(yaw) + (dy * unit * Math.sin(yaw)) / Math.sin(0.7)
      destZ += dx * unit * Math.sin(yaw) - (dy * unit * Math.cos(yaw)) / Math.sin(0.7)
      clampFocus()
      focusX = destX
      focusZ = destZ
      dirty = true
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
      shadow.geometry.dispose()
      shadow.material.dispose()
      sun.shadow.dispose()
      renderer.dispose()
    },
  }
}
