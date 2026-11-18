import { Carving, oak, honey, dark, leaf, lime, type Point } from './carving'
import { tree } from './models'
const teal = '#669fa0',
  rose = '#e38c8f',
  straw = '#e8bc72',
  stone = '#aba896'

export function furniture(m: Carving, id: string) {
  switch (id.replace('out-', '')) {
    case 'big-tree':
      tree(m, id)
      break
    case 'pond':
    case 'fountain': {
      m.ball(stone, [0, 0.075, 0], [0.94, 0.12, 0.79])
      m.ball('#69b7bb', [0, 0.14, 0], [0.85, 0.087, 0.69])
      for (let i = 0; i < 14; i++) {
        const a = (i * Math.PI) / 7
        m.ball(i % 2 ? '#c9c6aa' : '#b2b29d', [0.85 * Math.cos(a), 0.15, 0.71 * Math.sin(a)], [0.14, 0.115, 0.13])
      }
      if (id === 'out-fountain') {
        m.beam('#d4c7a6', [0, 0.2, 0], [0, 0.75, 0], 0.12)
        m.ball('#d5cfb6', [0, 0.73, 0], [0.4, 0.1, 0.4])
        m.ball('#85cbd0', [0, 0.91, 0], [0.08, 0.24, 0.08])
      } else
        for (let i = 0; i < 3; i++) m.ball('#89ad66', [i * 0.19 - 0.46, 0.229, (i % 2) * 0.18], [0.133, 0.018, 0.1])
      break
    }
    case 'scarecrow': {
      m.beam(oak, [0, 0, 0], [0, 1.3, 0], 0.067)
      m.beam(straw, [-0.44, 0.85, 0], [0.44, 0.85, 0], 0.065)
      m.box('#739c97', [0, 0.8, 0], [0.39, 0.46, 0.27])
      m.ball('#f3cf99', [0, 1.21, 0], [0.221, 0.217, 0.19])
      m.ball(straw, [0, 1.37, 0], [0.34, 0.048, 0.27])
      m.cone('#c88f58', [0, 1.46, 0], [0.229, 0.22, 0.215])
      for (const s of [-1, 1]) {
        m.ball(dark, [s * 0.079, 1.23, 0.171], [0.028, 0.03, 0.023])
        m.ball(rose, [s * 0.124, 1.16, 0.15], [0.044, 0.027, 0.025])
      }
      m.box('#d47669', [0.025, 1.014, 0.088], [0.29, 0.09, 0.2], [0, 0, 0.18])
      break
    }
    case 'path':
    case 'rock':
      m.ball(
        id === 'out-rock' ? stone : '#d9cbae',
        [0, id === 'out-rock' ? 0.2 : 0.05, 0],
        [0.42, id === 'out-rock' ? 0.35 : 0.071, 0.31],
        [0, 0.28, -0.06],
      )
      break
    case 'fence':
    case 'bench': {
      const bench = id === 'out-bench',
        w = bench ? 0.73 : 0.36
      for (const x of [-w, w]) {
        m.box(oak, [x, 0.38, -0.16], [0.11, 0.74, 0.12])
        if (bench) m.box(oak, [x, 0.18, 0.17], [0.11, 0.36, 0.12])
      }
      for (let i = 0; i < 2; i++)
        m.box(i ? honey : '#c78c59', [0, 0.41 + i * 0.21, -0.16], [2 * w + 0.17, 0.155, 0.105])
      if (bench) for (let i = 0; i < 3; i++) m.box(honey, [0, 0.39, i * 0.145 - 0.1], [1.58, 0.09, 0.136])
      break
    }
    case 'birdhouse': {
      m.beam(oak, [0, 0, 0], [0, 1.18, 0], 0.073)
      m.box('#e8c88c', [0, 1.32, 0], [0.52, 0.53, 0.47])
      for (const s of [-1, 1]) m.box(teal, [s * 0.15, 1.65, 0], [0.39, 0.09, 0.58], [0, 0, -s * 0.5])
      m.ball(dark, [0, 1.38, 0.245], [0.103, 0.104, 0.022])
      m.beam(oak, [0, 1.19, 0.23], [0, 1.19, 0.38], 0.034)
      break
    }
    case 'beehive':
      for (let i = 0; i < 4; i++)
        m.box(i % 2 ? straw : honey, [0, 0.15 + i * 0.143, 0], [0.64 - i * 0.035, 0.15, 0.58 - i * 0.035])
      m.cone(straw, [0, 0.75, 0], [0.44, 0.27, 0.41])
      m.ball(dark, [0, 0.24, 0.282], [0.087, 0.072, 0.03])
      break
    case 'bucket':
    case 'picnic':
      m.box(id === 'out-bucket' ? teal : honey, [0, 0.2, 0], [0.5, 0.37, 0.44])
      m.box(id === 'out-bucket' ? '#87c7cd' : rose, [0, 0.39, 0], [0.46, 0.036, 0.4])
      m.ring(oak, [0, 0.39, 0], [0.205, 0.247, 0.24])
      break
    case 'street-lamp':
    case 'star-lamp':
      m.beam(oak, [0, 0, 0], [0, 1.28, 0], 0.063)
      m.ball('#ffdf87', [0, 1.39, 0], [0.21, 0.25, 0.21])
      m.cone(teal, [0, 1.66, 0], [0.26, 0.15, 0.26])
      break
    case 'parasol':
      m.beam(honey, [0, 0, 0], [0, 1.43, 0], 0.05)
      m.cone(rose, [0, 1.38, 0], [0.69, 0.39, 0.69])
      m.ball('#ffdab4', [0, 1.6, 0], [0.065, 0.065, 0.065])
      break
    case 'arch':
    case 'swing':
    case 'golden-swing': {
      const gold = id.includes('golden') ? '#e9b950' : honey
      for (const s of [-1, 1])
        for (const z of [-1, 1]) m.beam(gold, [s * 0.74, 0, z * 0.33], [s * 0.74, 1.62, 0], 0.071)
      m.beam(gold, [-0.87, 1.62, 0], [0.87, 1.62, 0], 0.096)
      if (id === 'out-arch')
        for (let i = 0; i < 10; i++) {
          m.ball(
            i % 2 ? leaf : lime,
            [(i - 4.5) * 0.158, 1.63 + 0.13 * Math.sin((i * Math.PI) / 9), 0],
            [0.156, 0.15, 0.14],
          )
          m.ball(rose, [(i - 4.5) * 0.158, 1.68 + 0.13 * Math.sin((i * Math.PI) / 9), 0.11], [0.082, 0.072, 0.066])
        }
      else {
        for (const s of [-1, 1]) m.beam(straw, [s * 0.35, 0.55, 0.06], [s * 0.35, 1.6, 0], 0.027)
        m.box(rose, [0, 0.54, 0.06], [0.88, 0.09, 0.39])
      }
      break
    }
    case 'tent':
      for (const s of [-1, 1])
        m.box(s === 1 ? teal : '#87b8ad', [s * 0.35, 0.58, 0], [1.36, 0.09, 1.5], [0, 0, -s * 0.98])
      m.beam(oak, [0, 1.16, -0.82], [0, 1.16, 0.82], 0.058)
      break
    case 'slide':
      m.box(teal, [0, 0.6, 0.13], [0.64, 0.13, 1.68], [0.63, 0, 0])
      for (const s of [-1, 1]) m.beam(honey, [s * 0.25, 0, -0.83], [s * 0.25, 1.28, -0.49], 0.05)
      for (let i = 0; i < 4; i++)
        m.beam(honey, [-0.25, 0.16 + i * 0.27, -0.79 + i * 0.067], [0.25, 0.16 + i * 0.27, -0.79 + i * 0.067], 0.044)
      break
    case 'bike':
      for (const s of [-1, 1]) m.ring(dark, [s * 0.29, 0.245, 0], [0.22, 0.22, 0.28])
      m.beam(teal, [-0.28, 0.25, 0], [0.015, 0.53, 0], 0.042)
      m.beam(teal, [0.015, 0.53, 0], [0.29, 0.24, 0], 0.04)
      m.beam(teal, [-0.28, 0.25, 0], [0.25, 0.27, 0], 0.041)
      m.beam(oak, [0.28, 0.25, 0], [0.22, 0.69, 0], 0.03)
      m.box(dark, [-0.02, 0.57, 0], [0.2, 0.065, 0.13])
      m.box(honey, [0.22, 0.69, 0], [0.08, 0.05, 0.23])
      break
  }
}

export function animal(m: Carving, id: string) {
  if (id === 'bee') {
    honeybee(m)
    return
  }
  if (id === 'butterfly') {
    m.ball(dark, [0, 0, 0], [0.092, 0.083, 0.19])
    for (const s of [-1, 1])
      for (let i = 0; i < 2; i++) {
        const x = s * (i ? 0.137 : 0.19),
          z = i ? -0.094 : 0.072
        m.ball(
          '#397a96',
          [x, 0.084, z],
          [i ? 0.12 : 0.17, 0.04, i ? 0.125 : 0.15],
          [0, s * 0.24, s * 0.39],
        )
        m.ball(i ? '#87c8c2' : '#70c9db', [x, 0.119, z], [i ? 0.087 : 0.121, 0.014, 0.082], [0, s * 0.24, s * 0.39])
      }
    return
  }
  if (id === 'ladybug') {
    ladybug(m)
    return
  }
  const colors: Record<string, string> = {
    bird: '#7daebb',
    rabbit: '#f8e7d5',
    frog: '#87aa62',
    squirrel: '#be8357',
    cat: '#ddae75',
    hedgehog: '#a48568',
  }
  const c = colors[id] ?? honey
  m.ball(c, [0, 0.165, 0], [0.174, 0.17, 0.23])
  m.ball(c, [0, 0.33, 0.106], [0.163, 0.153, 0.155])
  for (const s of [-1, 1]) {
    m.ball(dark, [s * 0.079, 0.348, 0.23], [0.026, 0.03, 0.022])
    m.ball('#fff4db', [s * 0.082, 0.357, 0.247], [0.009, 0.01, 0.006])
    if (id === 'rabbit') m.ball(c, [s * 0.079, 0.53, 0.06], [0.047, 0.14, 0.056], [0, 0, -s * 0.17])
    if (id === 'bird') m.ball('#57909d', [s * 0.135, 0.19, -0.019], [0.078, 0.107, 0.17], [0.3, 0, 0])
    if (id === 'cat' || id === 'squirrel') m.cone(c, [s * 0.102, 0.46, 0.08], [0.058, 0.124, 0.06])
  }
  if (id === 'bird') m.cone('#edb451', [0, 0.3, 0.275], [0.047, 0.11, 0.046], [Math.PI / 2, 0, 0])
}

/** Broad bands wrap the abdomen so they read from above as well as from the side. */
function honeybee(m: Carving) {
  const gold = '#f6b737', ink = '#493329', wing = '#d6eff2'
  m.ball(gold, [0, 0, -0.12], [0.185, 0.17, 0.26])
  for (const z of [-0.245, -0.085]) {
    const section = Math.sqrt(1 - ((z + 0.12) / 0.26) ** 2)
    m.ring(ink, [0, 0, z], [0.176 * section, 0.162 * section, 0.27])
  }
  m.ball('#aa6834', [0, 0.012, 0.092], [0.144, 0.147, 0.14])
  m.ball('#ffd16a', [0, 0.035, 0.236], [0.156, 0.146, 0.13])

  for (const side of [-1, 1]) {
    m.ball(ink, [side * 0.098, 0.065, 0.327], [0.044, 0.054, 0.033])
    m.ball('#fff7de', [side * 0.105, 0.087, 0.35], [0.014, 0.015, 0.012])
    m.beam(ink, [side * 0.064, 0.152, 0.263], [side * 0.115, 0.246, 0.302], 0.013)
    m.ball(ink, [side * 0.12, 0.249, 0.307], [0.024, 0.022, 0.024])

    // Small hindwings sit underneath the longer forewings, clear of the stripes.
    m.ball('#afd7dd', [side * 0.19, 0.105, -0.006], [0.15, 0.023, 0.068], [0, side * 0.48, side * 0.30])
    m.ball(wing, [side * 0.218, 0.158, 0.087], [0.215, 0.027, 0.088], [0, side * 0.20, side * 0.43])
    m.beam('#9ac7ce', [side * 0.086, 0.124, 0.108], [side * 0.372, 0.245, 0.061], 0.009)

    for (const z of [-0.1, 0.012, 0.115]) {
      m.beam(ink, [side * 0.088, -0.072, z], [side * 0.146, -0.151, z - 0.035], 0.013)
    }
    m.ball('#efa343', [side * 0.15, -0.15, -0.14], [0.036, 0.043, 0.042])
  }
}

/** A proper ladybird: glossy red domed shell split down the middle, seven black spots,
 *  a black head with white cheek marks and big friendly eyes, antennae and six little legs. */
function ladybug(carving: Carving) {
  // Real ladybirds are tiny; the toy one is drawn larger so she reads from across the garden.
  const k = 1.6,
    at = (p: Point): Point => [p[0] * k, p[1] * k, p[2] * k]
  const m = {
    ball: (c: string, p: Point, s: Point) => carving.ball(c, at(p), at(s)),
    beam: (c: string, a: Point, b: Point, radius: number) => carving.beam(c, at(a), at(b), radius * k),
  }
  const red = '#dc3f33',
    ink = '#2a2321',
    cream = '#fff4db'
  const c: Point = [0, 0.1, -0.03],
    r: Point = [0.2, 0.15, 0.25]
  // Legs first, poking out from under the shell
  for (const s of [-1, 1])
    for (const z of [-0.1, 0, 0.1]) {
      m.beam(ink, [s * 0.13, 0.07, z], [s * 0.22, 0.05, z * 1.35], 0.017)
      m.beam(ink, [s * 0.22, 0.05, z * 1.35], [s * 0.25, 0.008, z * 1.5], 0.015)
    }
  m.ball(ink, [0, 0.07, -0.02], [0.17, 0.06, 0.22])
  // The shell and the line where the two wing cases meet
  m.ball(red, c, r)
  m.ball(ink, [c[0], c[1] + 0.003, c[2] - 0.004], [0.011, r[1] + 0.006, r[2] + 0.004])
  // Seven spots sitting on the dome
  const spot = (dx: number, dy: number, dz: number, size: number) => {
    const l = Math.hypot(dx, dy, dz)
    m.ball(ink, [c[0] + (r[0] * dx) / l, c[1] + (r[1] * dy) / l, c[2] + (r[2] * dz) / l], [size, size * 0.7, size])
  }
  spot(0, 0.75, 0.66, 0.05)
  for (const s of [-1, 1]) {
    spot(s * 0.55, 0.75, 0.25, 0.047)
    spot(s * 0.8, 0.5, -0.25, 0.043)
    spot(s * 0.4, 0.75, -0.55, 0.04)
  }
  // Head with white cheeks, eyes and antennae
  m.ball(ink, [0, 0.11, 0.21], [0.12, 0.085, 0.085])
  for (const s of [-1, 1]) {
    m.ball(cream, [s * 0.085, 0.13, 0.215], [0.03, 0.026, 0.03])
    m.ball(cream, [s * 0.045, 0.125, 0.278], [0.032, 0.036, 0.022])
    m.ball(ink, [s * 0.045, 0.125, 0.296], [0.016, 0.019, 0.008])
    m.ball(cream, [s * 0.04, 0.133, 0.302], [0.005, 0.006, 0.003])
    m.beam(ink, [s * 0.035, 0.18, 0.25], [s * 0.085, 0.27, 0.32], 0.011)
    m.ball(ink, [s * 0.088, 0.275, 0.325], [0.022, 0.022, 0.022])
  }
  m.ball('#f29a8f', [0, 0.095, 0.29], [0.022, 0.01, 0.01])
}
