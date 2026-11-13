import { Carving, oak, honey, dark, leaf, lime } from './carving'
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
  if (id === 'butterfly' || id === 'bee') {
    m.ball(id === 'bee' ? '#e5aa37' : dark, [0, 0, 0], [0.092, 0.083, 0.19])
    for (const s of [-1, 1])
      for (let i = 0; i < 2; i++) {
        const x = s * (i ? 0.137 : 0.19),
          z = i ? -0.094 : 0.072
        m.ball(
          id === 'bee' ? '#cde6df' : '#397a96',
          [x, 0.084, z],
          [i ? 0.12 : 0.17, 0.04, i ? 0.125 : 0.15],
          [0, s * 0.24, s * 0.39],
        )
        if (id === 'butterfly')
          m.ball(i ? '#87c8c2' : '#70c9db', [x, 0.119, z], [i ? 0.087 : 0.121, 0.014, 0.082], [0, s * 0.24, s * 0.39])
      }
    return
  }
  const colors: Record<string, string> = {
    bird: '#7daebb',
    rabbit: '#f8e7d5',
    frog: '#87aa62',
    squirrel: '#be8357',
    cat: '#ddae75',
    hedgehog: '#a48568',
    ladybug: '#d66a58',
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
