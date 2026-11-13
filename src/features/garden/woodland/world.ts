import * as T from 'three'
import { BALANCE } from '../../../data/balance'
import { carvedMaterial } from './surface'
import { Carving, honey, leaf, lime } from './carving'

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

export function createWorld(canvas: HTMLCanvasElement) {
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
    close = false,
    zoom = 1,
    frame = 0,
    last = 0,
    dirty = true
  let focusX = W / 2,
    focusZ = H / 2
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
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.right = (height * aspect) / 2
    camera.left = -camera.right
    const target = new T.Vector3(focusX, 0.55, focusZ)
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
    const animating = Math.abs(destYaw - yaw) > 0.002 || Math.abs((close ? 1.65 : 1) - zoom) > 0.002
    const flies = !reduced && toys.some((t) => t.fly)
    if (!dirty && !animating && !flies) return
    const dt = Math.min(0.2, (at - last) / 1000)
    last = at
    const weight = reduced ? 1 : 1 - Math.exp(-dt * 10)
    yaw += (destYaw - yaw) * weight
    zoom += ((close ? 1.65 : 1) - zoom) * weight
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
      close = next
      if (!next) {
        focusX = W / 2
        focusZ = H / 2
      }
      dirty = true
    },
    pan(dx: number, dy: number) {
      if (!close) return
      const unit = (camera.top - camera.bottom) / (canvas.clientHeight || 1)
      focusX = T.MathUtils.clamp(focusX - dx * unit * Math.cos(yaw) - (dy * unit * Math.sin(yaw)) / Math.sin(0.7), 0, W)
      focusZ = T.MathUtils.clamp(focusZ + dx * unit * Math.sin(yaw) - (dy * unit * Math.cos(yaw)) / Math.sin(0.7), 0, H)
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
