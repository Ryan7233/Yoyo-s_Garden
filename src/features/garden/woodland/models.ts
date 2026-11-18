import * as T from 'three'
import { Carving, oak, dark, honey, leaf, lime, tint } from './carving'
const turn = Math.PI * 2

export function cottage(m: Carving, roof: string) {
  m.box('#ceb593', [0, 0.13, 0], [2.4, 0.26, 2.05])
  m.box('#ffe6ae', [0, 0.91, 0], [2.23, 1.62, 1.86])
  for (const x of [-1.07, 1.07]) for (const z of [-0.9, 0.9]) m.box(honey, [x, 0.91, z], [0.13, 1.56, 0.13])
  // Horizontal wooden siding fills the gables right up to the ridge.
  for (let i = 0; i < 10; i++)
    m.box(i % 2 ? '#f4d7a6' : '#ffe5b8', [0, 1.72 + i * 0.085, 0], [2.19 - i * 0.21, 0.1, 1.85])
  for (const side of [-1, 1]) {
    m.box(tint(roof, -0.45), [side * 0.62, 2.13, 0], [1.59, 0.17, 2.34], [0, 0, -side * 0.64])
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 7; col++) {
        const x = 1.1 - row * 0.299
        const z = (col - 3) * 0.326 + (row % 2 ? 0.026 : -0.026)
        m.box(
          tint(roof, (((row * 7 + col * 3) % 8) - 3) * 0.063),
          [side * x, 2.68 - 0.75 * x, z],
          [0.49, 0.16, 0.354],
          [0, 0, -side * 0.64],
        )
      }
  }
  m.beam(tint(roof, 0.32), [0, 2.72, -1.19], [0, 2.72, 1.19], 0.095)
  m.box('#ce8168', [0.67, 2.45, -0.55], [0.34, 0.85, 0.35])
  m.box('#e2aa8a', [0.67, 2.9, -0.55], [0.44, 0.13, 0.45])
  m.box(dark, [0.67, 2.972, -0.55], [0.27, 0.015, 0.27])
  m.box(oak, [0, 0.58, 0.975], [0.64, 0.96, 0.1])
  m.ball(oak, [0, 1.04, 0.974], [0.318, 0.27, 0.055])
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.099
    m.box(i % 2 ? '#c99059' : '#d09861', [x, 0.63, 1.034], [0.096, 0.85 - 0.07 * Math.abs(i - 2), 0.032])
  }
  m.beam(oak, [-0.42, 1.38, 0.95], [-0.42, 1.38, 1.15], 0.029)
  m.cone('#f2c171', [-0.42, 1.29, 1.14], [0.095, 0.129, 0.095])
  m.ball('#f9ce6c', [0.205, 0.59, 1.074], [0.05, 0.05, 0.04])
  for (let i = 0; i < 3; i++)
    m.box(i % 2 ? '#c69771' : '#e1b78b', [0, 0.08 + i * 0.07, 1.28 - i * 0.12], [0.98 - i * 0.09, 0.15, 0.39])
  const window = (x: number) => {
    m.box(oak, [x, 1.06, 0.96], [0.52, 0.61, 0.12])
    m.box('#a4d9dd', [x, 1.07, 1.03], [0.41, 0.48, 0.07])
    m.box('#fff1be', [x, 1.07, 1.076], [0.045, 0.5, 0.038])
    m.box('#fff1be', [x, 1.07, 1.076], [0.43, 0.047, 0.038])
    m.box('#af6654', [x, 0.73, 1.065], [0.62, 0.15, 0.23])
    for (let j = 0; j < 5; j++) {
      m.ball(leaf, [x + (j - 2) * 0.103, 0.84, 1.09], [0.09, 0.08, 0.077])
      m.ball(j % 2 ? '#ff91ab' : '#ffd16d', [x + (j - 2) * 0.1, 0.91 + (j % 2) * 0.025, 1.12], [0.068, 0.066, 0.06])
    }
  }
  window(-0.71)
  window(0.71)
  for (const side of [-1, 1]) {
    m.box(oak, [side * 1.125, 1.05, 0], [0.09, 0.65, 0.63])
    m.box('#acdce0', [side * 1.18, 1.06, 0], [0.035, 0.51, 0.49])
    m.box('#fff1bd', [side * 1.204, 1.06, 0], [0.03, 0.51, 0.045])
    m.box('#fff1bd', [side * 1.204, 1.06, 0], [0.03, 0.045, 0.49])
  }
  m.ring(honey, [0, 1.96, 0.95], [0.205, 0.205, 0.24])
  m.ball('#8fc7ca', [0, 1.96, 0.943], [0.18, 0.18, 0.025])
}

type P3 = [number, number, number]
const add = (a: P3, b: P3, k = 1): P3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]
const unit = (v: P3): P3 => {
  const l = Math.hypot(...v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
/** Rotation that turns a part's local +Z toward `dir` so flat things like petals face outward. */
function facing(dir: P3): P3 {
  const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(...unit(dir)))
  const e = new T.Euler().setFromQuaternion(q)
  return [e.x, e.y, e.z]
}

/** Rotation whose local Y points along `y` and local Z along `z` (both unit, at right angles). */
function basis(y: P3, z: P3): P3 {
  const x = cross(y, z)
  const e = new T.Euler().setFromRotationMatrix(
    new T.Matrix4().makeBasis(new T.Vector3(...x), new T.Vector3(...y), new T.Vector3(...z)),
  )
  return [e.x, e.y, e.z]
}

/** The mascot: a flower-bud sprite on a short stem with two leaves, in the garden's theme colour. */
export function mascot(m: Carving, color: string) {
  m.beam('#4f9146', [0, 0, 0], [0, 0.2, 0], 0.035)
  for (const s of [-1, 1]) m.ball(s === 1 ? '#7cc160' : '#8fcd6b', [s * 0.17, 0.09, 0.02], [0.15, 0.045, 0.085], [0, 0, s * 0.35])
  m.ball(color, [0, 0.46, 0], [0.27, 0.3, 0.25])
  m.cone(color, [0, 0.78, 0], [0.165, 0.3, 0.155])
  m.ball(tint(color, 0.55), [0, 0.7, 0.1], [0.06, 0.2, 0.06])
  m.ball(tint(color, -0.25), [0.13, 0.36, -0.1], [0.17, 0.2, 0.16])
  face(m, [0, 0.44, 0.245], 0.2, 'happy')
}

export type Mood = 'happy' | 'sad' | 'ripe'
/**
 * A little face on the +Z side of a plant: bean eyes, pink cheeks and a mouth.
 * `s` is roughly the radius of the head it sits on. Sad faces (thirsty plants) have
 * low half-closed eyes, worried brows and a downturned mouth; ripe ones laugh.
 */
export function face(m: Carving, at: P3, s: number, mood: Mood = 'happy') {
  const [x, y, z] = at
  const sad = mood === 'sad',
    ink = '#3e2b25'
  const eyeY = y + (sad ? 0.0 : 0.08) * s
  for (const k of [-1, 1]) {
    m.ball(ink, [x + k * 0.36 * s, eyeY, z], [0.12 * s, (sad ? 0.085 : 0.145) * s, 0.05 * s])
    m.ball('#ffffff', [x + k * 0.36 * s - 0.035 * s, eyeY + 0.05 * s, z + 0.04 * s], [0.04 * s, 0.04 * s, 0.02 * s])
    m.ball('#f79bb0', [x + k * 0.68 * s, y - 0.2 * s, z - 0.02 * s], [0.14 * s, 0.085 * s, 0.03 * s])
    if (sad) m.beam(ink, [x + k * 0.52 * s, eyeY + 0.17 * s, z], [x + k * 0.2 * s, eyeY + 0.28 * s, z], 0.026 * s)
  }
  if (mood === 'ripe') {
    m.ball('#8a3b3b', [x, y - 0.27 * s, z], [0.15 * s, 0.12 * s, 0.04 * s])
    m.ball('#f08a8a', [x, y - 0.32 * s, z + 0.02 * s], [0.09 * s, 0.05 * s, 0.03 * s])
    return
  }
  // The mouth is a little curve of three short strokes: a U when happy, upside down when thirsty.
  const dip = sad ? 0.07 : -0.08
  const pts: [number, number][] = [
    [-0.17, -0.25],
    [-0.07, -0.25 + dip],
    [0.07, -0.25 + dip],
    [0.17, -0.25],
  ]
  for (let i = 0; i < 3; i++)
    m.beam(ink, [x + pts[i][0] * s, y + pts[i][1] * s, z], [x + pts[i + 1][0] * s, y + pts[i + 1][1] * s, z], 0.028 * s)
}

type Kind = 'apple' | 'orange' | 'peach' | 'cherry' | 'pine' | 'star' | 'plain'
const kindOf = (id: string): Kind =>
  (['apple', 'orange', 'peach', 'cherry', 'pine', 'star'] as const).find((k) => id.includes(k + '-tree')) ?? 'plain'

/** Each species reads differently from far away: colour of the leaves and the outline of the crown. */
const LEAVES: Record<Kind, string[]> = {
  apple: ['#7ea446', '#6f9640', '#8db352'],
  orange: ['#4f8a45', '#5f9c4d', '#437a3c'],
  peach: ['#9cbc58', '#a9c768', '#8aad4d'],
  cherry: ['#f1a9b8', '#f7c3ca', '#e693a9'],
  star: ['#94bfc6', '#a9acdb', '#9fcab8'],
  pine: ['#4f8460', '#5c9468', '#477656'],
  plain: ['#9db953', '#81a44e', '#afc561'],
}
type Crown = { c: P3; r: P3 }
/** A lumpy leaf cloud: soft inner clumps plus carved leaf scales over the surface. */
function crown(m: Carving, k: Crown, colors: string[], seed: number, scale = 1) {
  const [rx, ry, rz] = k.r
  for (let i = 0; i < 6; i++) {
    const a = seed + i * 1.047
    m.ball(
      colors[i % colors.length],
      add(k.c, [Math.sin(a) * rx * 0.42, (i % 2 ? 0.12 : -0.14) * ry, Math.cos(a) * rz * 0.42]),
      [rx * 0.6, ry * 0.62, rz * 0.6],
    )
  }
  m.ball(colors[0], add(k.c, [0, ry * 0.36, 0]), [rx * 0.6, ry * 0.6, rz * 0.6])
  const n = Math.round(24 * (rx + rz))
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 1.6,
      rr = Math.sqrt(Math.max(0, 1 - y * y)),
      a = seed + i * 2.39996
    m.ball(
      colors[(i + 1) % colors.length],
      add(k.c, [Math.sin(a) * rr * rx * 0.97, y * ry * 0.97, Math.cos(a) * rr * rz * 0.97]),
      [0.11 * scale, 0.07 * scale, 0.16 * scale],
      [Math.cos(a) * 0.35, a, Math.sin(a) * 0.35],
    )
  }
}
/** Points on the crown's outer skin where blossoms and fruit hang, spread all the way round. */
function spots(k: Crown, n: number, seed: number) {
  const out: { at: P3; dir: P3 }[] = []
  for (let i = 0; i < n; i++) {
    const y = 0.45 - ((i + 0.5) / n) * 1.0,
      rr = Math.sqrt(1 - y * y),
      a = seed + i * 2.39996
    const dir = unit([Math.sin(a) * rr, y, Math.cos(a) * rr])
    out.push({ at: [k.c[0] + dir[0] * k.r[0], k.c[1] + dir[1] * k.r[1], k.c[2] + dir[2] * k.r[2]], dir })
  }
  return out
}

function blossom(m: Carving, at: P3, dir: P3, petal: string) {
  const side = unit(Math.abs(dir[1]) > 0.9 ? cross(dir, [1, 0, 0]) : cross(dir, [0, 1, 0])),
    up = cross(dir, side),
    face = facing(dir),
    centre = add(at, dir, 0.12)
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5
    m.ball(petal, add(add(centre, side, Math.cos(a) * 0.055), up, Math.sin(a) * 0.055), [0.052, 0.052, 0.022], face)
  }
  m.ball('#f4c84f', add(centre, dir, 0.012), [0.028, 0.028, 0.018], face)
}

/** One piece of fruit at `at`, pushed out along `dir` so it sits on the leaves, not inside them. */
function fruit(m: Carving, kind: Kind, at: P3, dir: P3, ripe: boolean) {
  const s = kind === 'star' ? (ripe ? 0.19 : 0.1) : ripe ? (kind === 'peach' ? 0.145 : 0.13) : 0.09
  const p = add(at, dir, s * 0.55)
  if (kind === 'star') {
    // Five pointed arms around a plump centre, facing out of the crown like a sticker.
    const color = ripe ? '#ffd23f' : '#eef3c0'
    const side = unit(Math.abs(dir[1]) > 0.9 ? cross(dir, [1, 0, 0]) : cross(dir, [0, 1, 0])),
      up = cross(dir, side)
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5
      const out = unit(add(add([0, 0, 0], up, Math.cos(a)), side, Math.sin(a)))
      m.ball(color, add(p, out, s * 0.5), [s * 0.2, s * 0.46, s * 0.14], basis(out, dir))
    }
    m.ball(color, p, [s * 0.36, s * 0.36, s * 0.2], facing(dir))
    return
  }
  // Unripe fruit is a pale lime so it still stands out against the leaves.
  const green = kind === 'orange' ? '#c9d86a' : '#dbe28a'
  const color = !ripe ? green : kind === 'apple' ? '#d9473f' : kind === 'orange' ? '#f39a2e' : '#ffd29a'
  m.ball(color, p, [s, s * (kind === 'apple' ? 0.92 : 1), s])
  if (ripe && kind === 'peach') m.ball('#f0767c', add(p, dir, s * 0.32), [s * 0.8, s * 0.86, s * 0.8])
  if (ripe && kind === 'apple') m.ball('#e8735a', add(add(p, dir, s * 0.35), [0, 1, 0], s * 0.2), [s * 0.6, s * 0.5, s * 0.6])
  m.beam(dark, add(p, [0, 1, 0], s * 0.8), add(p, [0, 1, 0], s * 1.25), 0.014)
  if (kind !== 'orange')
    m.ball(leaf, add(add(p, [0, 1, 0], s * 1.15), dir, 0.05), [0.035, 0.016, 0.075], [0, Math.atan2(dir[0], dir[2]), 0.4])
}

function trunk(m: Carving, top: P3, r: number) {
  m.beam(oak, [0, 0, 0], top, r)
  for (let i = 0; i < 3; i++) {
    const a = 0.6 + (i * Math.PI * 2) / 3
    m.ball(oak, [Math.sin(a) * r * 0.9, 0.03, Math.cos(a) * r * 0.9], [r * 0.75, r * 0.45, r * 0.75], [0, a, 0])
  }
}

/** Crowns for a grown tree; the peach is pruned open into three bowls so the branches show. */
function shape(m: Carving, kind: Kind): Crown[] {
  switch (kind) {
    case 'orange':
      trunk(m, [0, 0.85, 0], 0.12)
      return [{ c: [0, 1.45, 0], r: [0.62, 0.68, 0.62] }]
    case 'peach': {
      trunk(m, [0, 0.55, 0], 0.11)
      const out: Crown[] = []
      for (let i = 0; i < 3; i++) {
        const a = 0.5 + (i * Math.PI * 2) / 3
        m.beam(honey, [0, 0.5, 0], [Math.sin(a) * 0.4, 1.22, Math.cos(a) * 0.4], 0.065)
        out.push({ c: [Math.sin(a) * 0.44, 1.45, Math.cos(a) * 0.44], r: [0.38, 0.33, 0.38] })
      }
      return out
    }
    case 'cherry':
      trunk(m, [0.03, 1.05, 0], 0.13)
      for (const s of [-1, 1]) m.beam(honey, [0, 0.8, 0], [s * 0.42, 1.3, s * 0.08], 0.06)
      return [{ c: [0, 1.55, 0], r: [0.84, 0.5, 0.8] }]
    case 'star':
      trunk(m, [0.06, 0.7, 0], 0.1)
      m.beam(honey, [0.06, 0.68, 0], [-0.04, 1.2, 0.03], 0.085)
      return [{ c: [0, 1.6, 0], r: [0.6, 0.6, 0.6] }]
    default:
      trunk(m, [0.02, 1.05, 0], 0.13)
      for (const s of [-1, 1]) m.beam(honey, [0, 0.75, 0], [s * 0.32, 1.3, 0.05], 0.06)
      return [{ c: [0, 1.55, 0], r: [0.74, 0.58, 0.72] }]
  }
}

/**
 * A grown tree. `fruit` is what is on the branches right now:
 * 0 leaves only (just picked), 1 in blossom, 2 small green fruit, 3 ripe and ready to pick.
 */
export function tree(m: Carving, id: string, stage: 0 | 1 | 2 | 3 = 0, mood?: Mood) {
  const kind = kindOf(id)
  // Planted trees have a face on the trunk; the decorative big tree does not.
  if (mood) {
    // The face sits on a round burl that bulges out of the trunk, big enough to read from across the garden.
    const y = kind === 'peach' ? 0.36 : 0.46
    m.ball(tint(oak, 0.07), [0, y, 0.07], [0.25, 0.23, 0.2])
    face(m, [0, y + 0.01, 0.275], 0.2, mood)
  }
  if (kind === 'pine') {
    trunk(m, [0, 0.7, 0], 0.13)
    for (let i = 0; i < 4; i++)
      m.cone(LEAVES.pine[i % 3], [0, 0.95 + i * 0.36, 0], [0.72 - i * 0.14, 0.9, 0.72 - i * 0.14], [0, i * 0.7, 0])
    return
  }
  const crowns = shape(m, kind)
  // Peach trees flower before their leaves fill in, so a blossoming peach turns mostly pink.
  const colors = kind === 'peach' && stage === 1 ? ['#f5b4c4', '#a9c768', '#f9c8d3'] : LEAVES[kind]
  crowns.forEach((k, i) => crown(m, k, colors, i * 1.7 + id.length))
  if (kind === 'cherry') {
    // A few fallen petals keep the cherry tree pink from every side.
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4
      m.ball(LEAVES.cherry[i % 3], [Math.sin(a) * (0.3 + (i % 3) * 0.1), 0.012, Math.cos(a) * (0.28 + (i % 2) * 0.12)], [0.045, 0.01, 0.035], [0, a, 0])
    }
    return
  }
  if (kind === 'plain' || stage === 0) return
  const each = Math.ceil((kind === 'peach' ? 15 : kind === 'star' ? 9 : 13) / crowns.length)
  crowns.forEach((k, ci) =>
    spots(k, stage === 1 ? each * 2 : each, ci * 2.1 + 0.4).forEach(({ at, dir }, i) => {
      if (stage === 1) blossom(m, at, dir, kind === 'peach' ? '#f5a3b7' : kind === 'apple' ? '#fbe0e6' : '#fffaf0')
      else if (stage === 3 || i % 2 === 0) fruit(m, kind, at, dir, stage === 3)
    }),
  )
  // When the fruit is ripe, one has already dropped onto the soil under the tree.
  if (stage === 3 && kind !== 'star') fruit(m, kind, [0.34, 0.07, 0.24], [0, 0, 0.01], true)
}

/** Young trees already look like trees of their own kind, not like flower sprouts. */
export function sapling(m: Carving, id: string, stage: 1 | 2, mood: Mood = 'happy') {
  const kind = kindOf(id),
    tall = stage === 1 ? 0.36 : 0.72
  m.beam(oak, [0, 0, 0], [0.01, tall, 0], stage === 1 ? 0.035 : 0.06)
  if (kind === 'pine') {
    for (let i = 0; i < stage + 1; i++)
      m.cone(LEAVES.pine[i % 3], [0, tall * 0.55 + i * 0.16, 0], [0.26 - i * 0.06, 0.32, 0.26 - i * 0.06])
    face(m, [0, tall * 0.5, 0.2], 0.1, mood)
    return
  }
  if (stage === 1) {
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7
      m.ball(LEAVES[kind][i % 3], [Math.sin(a) * 0.08, tall - 0.02 + (i % 2) * 0.05, Math.cos(a) * 0.08], [0.05, 0.026, 0.09], [0.3, a, 0])
    }
    m.ball(LEAVES[kind][0], [0, tall + 0.03, 0.02], [0.085, 0.085, 0.08])
    face(m, [0, tall + 0.03, 0.1], 0.085, mood)
    return
  }
  crown(m, { c: [0, tall + 0.15, 0], r: [0.3, 0.27, 0.3] }, LEAVES[kind], id.length, 0.6)
  face(m, [0, tall + 0.13, 0.33], 0.17, mood)
}
function leaves(m: Carving, h: number) {
  m.beam('#698844', [0, 0.04, 0], [0.024, h, 0], 0.044)
  for (const s of [-1, 1]) {
    m.ball(
      s === 1 ? leaf : lime,
      [s * 0.122, h * (s === 1 ? 0.54 : 0.32), 0.008],
      [0.095, 0.205, 0.063],
      [0.12, 0, -s * 0.85],
    )
  }
}
/** Grown vegetables, each growing the way it really does: on a stake, along the ground, up a stalk. */
function veggie(m: Carving, id: string, mood: Mood) {
  if (id.includes('tomato')) {
    // A vine tied to a stake, with tomatoes hanging at different heights.
    m.beam(honey, [0, 0, -0.06], [0, 0.98, -0.06], 0.028)
    m.beam('#5f8f45', [0.02, 0, 0], [0.03, 0.84, 0], 0.03)
    for (let i = 0; i < 6; i++) {
      const a = i * 2.4
      m.ball(i % 2 ? leaf : lime, [Math.sin(a) * 0.17, 0.2 + i * 0.13, Math.cos(a) * 0.1 - 0.03], [0.14, 0.03, 0.085], [0, a, 0.3])
    }
    const fruit: [number, number, number, number, string][] = [
      [0.02, 0.36, 0.17, 0.15, '#dd4b3f'],
      [-0.18, 0.57, 0.1, 0.105, '#dd4b3f'],
      [0.17, 0.7, 0.08, 0.095, '#e9884a'],
    ]
    for (const [x, y, z, r, c] of fruit) {
      m.ball(c, [x, y, z], [r, r * 0.92, r])
      for (let n = 0; n < 5; n++) {
        const a = n * 1.257
        m.ball('#4f8a45', [x + Math.sin(a) * r * 0.42, y + r * 0.84, z + Math.cos(a) * r * 0.42], [r * 0.32, r * 0.1, r * 0.15], [0, a + Math.PI / 2, 0])
      }
      m.beam('#5f8f45', [x, y + r * 0.85, z], [x * 0.3, y + r * 1.5, z * 0.3], 0.014)
    }
    face(m, [0.02, 0.36, 0.315], 0.11, mood)
  } else if (id.includes('strawberry')) {
    // A low tuft of leaves with the berries lying out round the edge.
    for (let i = 0; i < 8; i++) {
      const a = i * 0.8
      m.ball(i % 2 ? leaf : '#6f9d4c', [Math.sin(a) * 0.2, 0.13 + (i % 3) * 0.035, Math.cos(a) * 0.2 - 0.05], [0.12, 0.035, 0.17], [-0.35, a, 0])
    }
    for (const [x, z] of [
      [-0.1, -0.02],
      [0.14, -0.1],
    ]) {
      for (let n = 0; n < 5; n++) m.ball('#fff6e6', [x + Math.sin(n * 1.257) * 0.04, 0.27, z + Math.cos(n * 1.257) * 0.04], [0.032, 0.012, 0.032])
      m.ball('#f4c84f', [x, 0.275, z], [0.022, 0.014, 0.022])
    }
    const berries: [number, number, number, number][] = [
      [0, 0.15, 0.26, 0.12],
      [-0.27, 0.11, 0.1, 0.085],
      [0.27, 0.11, 0.08, 0.085],
    ]
    for (const [x, y, z, r] of berries) {
      m.ball('#e0453f', [x, y, z], [r, r * 1.02, r * 0.95])
      m.cone('#e0453f', [x, y - r * 0.72, z], [r * 0.72, r * 0.95, r * 0.68], [Math.PI, 0, 0])
      for (let n = 0; n < 6; n++)
        m.ball('#ffe08a', [x + ((n % 3) - 1) * r * 0.42, y - r * 0.15 - Math.floor(n / 3) * r * 0.5, z + r * 0.86], [r * 0.07, r * 0.09, r * 0.05])
      for (let n = 0; n < 5; n++) {
        const a = n * 1.257
        m.ball('#4f8a45', [x + Math.sin(a) * r * 0.5, y + r * 0.92, z + Math.cos(a) * r * 0.5], [r * 0.34, r * 0.1, r * 0.17], [0, a + Math.PI / 2, 0])
      }
    }
    face(m, [0, 0.19, 0.375], 0.085, mood)
  } else if (id.includes('watermelon')) {
    // A big striped melon resting on the soil at the end of its vine.
    m.beam('#6f9d4c', [-0.38, 0.03, -0.2], [0.05, 0.05, -0.3], 0.025)
    m.beam('#6f9d4c', [0.05, 0.05, -0.3], [0.38, 0.04, -0.12], 0.025)
    m.beam('#6f9d4c', [-0.3, 0.2, 0.06], [-0.4, 0.3, -0.04], 0.02)
    for (let i = 0; i < 4; i++)
      m.ball(i % 2 ? leaf : lime, [-0.36 + i * 0.24, 0.1, -0.24 + (i % 2) * 0.06], [0.15, 0.03, 0.12], [0.2, i * 1.3, 0.2])
    m.ball('#6aa65c', [0, 0.21, 0.08], [0.31, 0.22, 0.25])
    for (let n = -2; n <= 2; n++) m.ball('#3f7743', [n * 0.115, 0.21, 0.08], [0.034, 0.224 - Math.abs(n) * 0.022, 0.254 - Math.abs(n) * 0.03])
    face(m, [0, 0.2, 0.335], 0.13, mood)
  } else if (id.includes('corn')) {
    // A tall stalk with long drooping leaves, a tassel on top and cobs in their husks.
    m.beam('#7fa04c', [0, 0, 0], [0, 1.02, 0], 0.042)
    for (let i = 0; i < 6; i++) {
      const a = i * 1.9
      m.ball(i % 2 ? leaf : lime, [Math.sin(a) * 0.2, 0.2 + i * 0.14, Math.cos(a) * 0.2], [0.06, 0.03, 0.25], [0.5, a, 0])
    }
    for (let n = 0; n < 6; n++) m.beam('#e3c77a', [0, 1.0, 0], [Math.sin(n * 1.05) * 0.11, 1.2, Math.cos(n * 1.05) * 0.11], 0.012)
    const cobs: [number, number, number, number][] = [
      [0.11, 0.54, 0.13, 1],
      [-0.13, 0.36, -0.02, 0.75],
    ]
    for (const [x, y, z, k] of cobs) {
      m.ball('#f6cb4f', [x, y, z], [0.1 * k, 0.2 * k, 0.1 * k], [0.2, 0, -Math.sign(x) * 0.25])
      for (const s of [-1, 1]) m.ball('#8db454', [x + s * 0.075 * k, y - 0.07 * k, z - 0.02], [0.05 * k, 0.17 * k, 0.09 * k], [0.2, 0, -Math.sign(x) * 0.25 - s * 0.2])
      m.ball('#c98f4a', [x + Math.sign(x) * 0.05 * k, y + 0.21 * k, z + 0.04 * k], [0.035 * k, 0.05 * k, 0.035 * k])
    }
    face(m, [0.12, 0.56, 0.228], 0.075, mood)
  } else {
    leaves(m, 0.47)
    if (id.includes('pumpkin')) {
      for (let i = 0; i < 8; i++)
        m.ball('#e89442', [Math.cos((i * turn) / 8) * 0.14, 0.25, Math.sin((i * turn) / 8) * 0.14], [0.17, 0.21, 0.16])
      m.beam(leaf, [0, 0.41, 0], [0.04, 0.54, 0], 0.045)
      face(m, [0, 0.25, 0.3], 0.15, mood)
    } else {
      // The carrot's shoulders poke out of the soil in front of its greens.
      m.ball('#e89442', [0, 0.1, 0.13], [0.13, 0.19, 0.13])
      face(m, [0, 0.14, 0.26], 0.1, mood)
    }
  }
}

const PETALS: Record<string, string[]> = {
  'seed-sunflower': ['#ffc43c', '#f6a329'],
  'seed-daisy': ['#fff6dd', '#ffe6b8'],
  'seed-rose': ['#ee758b', '#d44a6a'],
  'seed-hibiscus': ['#ee94a8', '#d76586'],
  'seed-tulip': ['#ff9f91', '#ea7885'],
  'seed-hyacinth': ['#af96de', '#8979c5'],
  'seed-lotus': ['#ffc0cc', '#e99eb4'],
  'seed-crystal-lotus': ['#a6e0e2', '#8eb6dd'],
  'seed-rainbow-flower': ['#ed8996', '#ffcb68', '#92c59b', '#99bdde', '#ad94c9'],
}

/**
 * Seedlings already show what they will be: a tomato on its little stake, corn as a blade of grass,
 * a melon vine creeping along the soil, feathery carrot tops. Flowers show a closed bud in their own colour.
 */
function sprout(m: Carving, id: string, stage: 1 | 2, mood: Mood) {
  const big = stage === 2,
    k = big ? 1 : 0.62
  /** A round little head for the face to sit on. */
  const head = (color: string, at: P3, r: number) => {
    m.ball(color, at, [r, r, r * 0.92])
    face(m, [at[0], at[1], at[2] + r * 0.9], r * 0.95, mood)
  }
  if (id.includes('tomato')) {
    m.beam(honey, [0, 0, -0.07], [0, 0.72 * k, -0.07], 0.024)
    m.beam('#5f8f45', [0.02, 0, 0], [0.02, 0.5 * k, 0], 0.028)
    for (let i = 0; i < (big ? 5 : 3); i++) {
      const a = i * 2.4
      m.ball(i % 2 ? leaf : lime, [Math.sin(a) * 0.14, (0.16 + i * 0.09) * k + 0.03, Math.cos(a) * 0.09 - 0.02], [0.12, 0.028, 0.07], [0, a, 0.3])
    }
    // The first tomato is still green.
    head(big ? '#a9cf62' : lime, [0.02, 0.5 * k + 0.06, 0.05], big ? 0.115 : 0.085)
    if (big) for (let n = 0; n < 5; n++) m.ball('#4f8a45', [0.02 + Math.sin(n * 1.257) * 0.05, 0.47, 0.05 + Math.cos(n * 1.257) * 0.05], [0.04, 0.012, 0.02], [0, n * 1.257 + Math.PI / 2, 0])
  } else if (id.includes('strawberry')) {
    for (let i = 0; i < (big ? 7 : 4); i++) {
      const a = i * 0.9
      m.ball(i % 2 ? leaf : '#6f9d4c', [Math.sin(a) * 0.17 * k, 0.09 + (i % 3) * 0.03, Math.cos(a) * 0.17 * k - 0.04], [0.1 * k + 0.02, 0.03, 0.14 * k + 0.02], [-0.35, a, 0])
    }
    if (big)
      for (const x of [-0.16, 0.17]) {
        for (let n = 0; n < 5; n++) m.ball('#fff6e6', [x + Math.sin(n * 1.257) * 0.045, 0.2, 0.08 + Math.cos(n * 1.257) * 0.045], [0.034, 0.012, 0.034])
        m.ball('#f4c84f', [x, 0.206, 0.08], [0.024, 0.014, 0.024])
      }
    head(lime, [0, 0.17 * k + 0.05, 0.1], big ? 0.105 : 0.085)
  } else if (id.includes('watermelon') || id.includes('pumpkin')) {
    // A vine along the ground with broad leaves; then a first small fruit (or a pumpkin flower).
    const melon = id.includes('watermelon')
    m.beam('#6f9d4c', [-0.3 * k, 0.03, -0.12], [0, 0.05, -0.2], 0.022)
    m.beam('#6f9d4c', [0, 0.05, -0.2], [0.3 * k, 0.04, -0.06], 0.022)
    for (let i = 0; i < (big ? 4 : 2); i++)
      m.ball(i % 2 ? leaf : lime, [(-0.3 + i * 0.2) * k + (big ? 0 : 0.1), 0.09, -0.16 + (i % 2) * 0.07], [0.14, 0.03, 0.115], [0.25, i * 1.3, 0.2])
    if (!big) head(lime, [0, 0.13, 0.04], 0.085)
    else if (melon) {
      m.ball('#7fb968', [0, 0.14, 0.06], [0.16, 0.125, 0.14])
      for (let n = -1; n <= 1; n++) m.ball('#3f7743', [n * 0.085, 0.14, 0.06], [0.022, 0.128 - Math.abs(n) * 0.014, 0.144 - Math.abs(n) * 0.02])
      face(m, [0, 0.14, 0.2], 0.09, mood)
    } else {
      for (let n = 0; n < 5; n++) m.ball('#f6c33f', [0.2 + Math.sin(n * 1.257) * 0.06, 0.13, -0.02 + Math.cos(n * 1.257) * 0.06], [0.05, 0.016, 0.05])
      for (let i = 0; i < 6; i++) m.ball('#b9c25a', [Math.cos((i * turn) / 6) * 0.07, 0.14, 0.06 + Math.sin((i * turn) / 6) * 0.07], [0.09, 0.11, 0.085])
      m.beam(leaf, [0, 0.22, 0.06], [0.02, 0.29, 0.06], 0.026)
      face(m, [0, 0.14, 0.215], 0.09, mood)
    }
  } else if (id.includes('corn')) {
    // A straight stalk with long blades, like tall grass.
    const h = big ? 0.74 : 0.36
    m.beam('#7fa04c', [0, 0, 0], [0, h, 0], big ? 0.036 : 0.028)
    for (let i = 0; i < (big ? 5 : 3); i++) {
      const a = i * 1.9
      m.ball(i % 2 ? leaf : lime, [Math.sin(a) * 0.16 * k, h * (0.3 + i * 0.16), Math.cos(a) * 0.16 * k], [0.05, 0.026, 0.2 * k + 0.03], [0.6, a, 0])
    }
    if (big) for (let n = 0; n < 4; n++) m.beam('#e3c77a', [0, h, 0], [Math.sin(n * 1.57) * 0.07, h + 0.13, Math.cos(n * 1.57) * 0.07], 0.01)
    head(lime, [0, h * 0.62, big ? 0.08 : 0.06], big ? 0.105 : 0.085)
  } else if (id.includes('carrot')) {
    // Feathery tops; later the orange shoulder starts to show.
    for (let i = 0; i < (big ? 7 : 4); i++) {
      const a = (i - (big ? 3 : 1.5)) * 0.33
      const tip: P3 = [Math.sin(a) * 0.36 * k, 0.42 * k + 0.05 - Math.abs(a) * 0.08, -0.03 + (i % 2) * 0.05]
      m.beam(i % 2 ? '#6f9d4c' : leaf, [0, 0.03, 0], tip, 0.018)
      for (let n = 1; n <= 3; n++)
        m.ball(i % 2 ? lime : leaf, [tip[0] * (n / 3.2), 0.03 + (tip[1] - 0.03) * (n / 3.2), tip[2] * (n / 3.2)], [0.055, 0.02, 0.03], [0, 0, -a + (n % 2 ? 0.7 : -0.7)])
    }
    head(big ? '#eea559' : lime, [0, big ? 0.075 : 0.1, 0.11], big ? 0.105 : 0.085)
  } else {
    // Flowers: a stem, two leaves and a round little head, with a closed bud once it has grown.
    const h = big ? 0.55 : 0.27,
      r = big ? 0.115 : 0.085
    leaves(m, h)
    head(lime, [0.02, h + r * 0.5, 0], r)
    const petal = PETALS[id]?.[0]
    if (big && petal) {
      m.ball(petal, [0.02, h + r * 1.5, 0], [r * 0.5, r * 0.62, r * 0.5])
      for (let n = 0; n < 3; n++) m.ball(leaf, [0.02 + Math.sin(n * 2.1) * r * 0.42, h + r * 1.28, Math.cos(n * 2.1) * r * 0.42], [r * 0.2, r * 0.36, r * 0.14], [0, n * 2.1, 0])
    }
  }
}

/** One cupped petal, repeated in widening turns around the tight centre of the rose. */
function roseBloom(m: Carving, h: number, mood: Mood) {
  const petal = new T.SphereGeometry(1, 16, 10)
  const points = petal.getAttribute('position')
  for (let i = 0; i < points.count; i++) {
    const x = points.getX(i),
      y = points.getY(i),
      z = points.getZ(i)
    const rim = (y + 1) / 2
    points.setXYZ(
      i,
      x * (0.66 + 0.42 * rim),
      y - 0.16 * x * x,
      0.16 * z - 0.3 * x * x + 0.48 * rim * rim + 0.2 * x * rim,
    )
  }
  petal.computeVertexNormals()
  const relief = petal.toNonIndexed()
  const layers = [
    { count: 7, radius: 0.167, width: 0.155, height: 0.116, lift: 0, tilt: 0.68, color: '#e97991' },
    { count: 5, radius: 0.098, width: 0.118, height: 0.103, lift: 0.064, tilt: 0.43, color: '#d75072' },
    { count: 3, radius: 0.042, width: 0.069, height: 0.073, lift: 0.114, tilt: 0.24, color: '#bb3c60' },
  ]
  m.ball('#be526e', [0, h, 0], [0.181, 0.09, 0.174])
  for (const [tier, layer] of layers.entries()) {
    for (let i = 0; i < layer.count; i++) {
      const a = (turn * i) / layer.count + tier * 0.74
      const normal = a + 0.36
      const rotation = basis(
        [Math.sin(normal) * Math.sin(layer.tilt), Math.cos(layer.tilt), Math.cos(normal) * Math.sin(layer.tilt)],
        [Math.sin(normal) * Math.cos(layer.tilt), -Math.sin(layer.tilt), Math.cos(normal) * Math.cos(layer.tilt)],
      )
      m.part(
        relief,
        tint(layer.color, i % 2 ? 0.055 : 0),
        [Math.sin(a) * layer.radius, h + layer.lift, Math.cos(a) * layer.radius],
        [layer.width, layer.height, layer.height],
        rotation,
      )
    }
  }
  m.ball('#b53d60', [0, h + 0.157, 0], [0.034, 0.037, 0.036])
  relief.dispose()
  petal.dispose()
  // The front lip carries the same expression as the other flowering plants.
  m.ball('#e5748c', [0, h - 0.027, 0.174], [0.123, 0.064, 0.057], [0.2, 0, 0])
  face(m, [0, h - 0.018, 0.231], 0.094, mood)
}

export function plant(m: Carving, id: string, stage: number, fruitStage: 0 | 1 | 2 | 3 = 0, mood: Mood = 'happy') {
  if (stage === 0) {
    m.ball('#96623d', [0, 0.04, 0], [0.18, 0.09, 0.15])
    m.ball('#dac085', [0.018, 0.114, 0], [0.075, 0.048, 0.045])
    face(m, [0, 0.06, 0.145], 0.1, mood)
    return
  }
  if (id.endsWith('-tree') && (stage === 1 || stage === 2)) {
    sapling(m, id, stage, mood)
    return
  }
  if (stage === 1 || stage === 2) {
    sprout(m, id, stage, mood)
    return
  }
  if (id.endsWith('-tree')) {
    tree(m, id, fruitStage, mood)
    return
  }
  if (/pumpkin|watermelon|carrot|corn|tomato|strawberry/.test(id)) {
    veggie(m, id, mood)
    return
  }
  const tall = id.includes('sunflower'),
    h = tall ? 0.9 : id.includes('lotus') ? 0.29 : 0.63
  leaves(m, h)
  const colors = PETALS[id] ?? ['#f6c98d', '#f2b4c9']
  if (id === 'seed-rose') {
    roseBloom(m, h, mood)
    return
  }
  if (/tulip|hyacinth|lotus/.test(id)) {
    const tiers = id.includes('hyacinth') ? 3 : 1
    for (let j = 0; j < tiers; j++)
      for (let i = 0; i < 6; i++) {
        const a = (i * turn) / 6
        m.ball(
          colors[(i + j) % colors.length],
          [Math.sin(a) * 0.104, h + j * 0.133, Math.cos(a) * 0.104],
          [0.105, 0.155, 0.105],
          [0.2 * Math.cos(a), 0, -0.2 * Math.sin(a)],
        )
      }
    face(m, [0, h + 0.02, 0.2], 0.1, mood)
  } else {
    const n = tall ? 15 : 9,
      rad = tall ? 0.227 : 0.15
    for (let i = 0; i < n; i++) {
      const a = (i * turn) / n
      m.ball(
        colors[i % colors.length],
        [Math.sin(a) * rad, h + Math.cos(a) * rad, 0.065],
        [tall ? 0.074 : 0.076, tall ? 0.163 : 0.113, 0.055],
        [0, 0, -a],
      )
    }
    m.ball(tall ? '#c08a4a' : '#ebad45', [0, h, 0.106], [rad * 0.81, rad * 0.81, 0.115])
    face(m, [0, h, 0.222], rad * 0.6, mood)
  }
}

/** The colour a plant's harvest flies off in: its fruit, or its petals. */
export function harvestTint(id: string): string {
  const fruit: Record<string, string> = {
    apple: '#d9473f', orange: '#f39a2e', peach: '#ffc48c', star: '#ffd23f', strawberry: '#da564a', tomato: '#da564a',
    carrot: '#e89442', pumpkin: '#e89442', corn: '#f5c652', watermelon: '#67965a', sunflower: '#ffc43c', daisy: '#fff6dd',
    rose: '#ee758b', hibiscus: '#ee94a8', tulip: '#ff9f91', hyacinth: '#af96de', lotus: '#ffc0cc',
  }
  return Object.entries(fruit).find(([k]) => id.includes(k))?.[1] ?? '#f6c98d'
}
