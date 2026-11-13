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

export function tree(m: Carving, id: string) {
  m.beam(oak, [0, 0, 0], [0.04, 1.28, 0], 0.16)
  for (const s of [-1, 1]) m.beam(honey, [0, 0.63, 0], [s * 0.4, 1.33, 0.06], 0.074)
  if (id.includes('pine')) {
    for (let i = 0; i < 3; i++)
      m.cone(i % 2 ? leaf : '#598c69', [0, 1 + i * 0.39, 0], [0.65 - i * 0.13, 1.12, 0.65 - i * 0.13])
    return
  }
  const cherry = id.includes('cherry')
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4
    const radius = i === 6 ? 0 : 0.42
    m.ball(
      cherry ? ['#f1a9af', '#f7bebb', '#e891a4'][i % 3] : ['#9db953', '#81a44e', '#afc561'][i % 3],
      [Math.sin(a) * radius, i === 6 ? 1.9 : 1.48 + 0.12 * Math.cos(a * 2), Math.cos(a) * radius],
      [0.52, 0.56, 0.51],
    )
  }
  for (let i = 0; i < 32; i++) {
    const a = i * 2.39996,
      y = (i + 0.5) / 32
    const r = 0.79 * Math.sqrt(1 - y * y)
    m.ball(
      cherry ? (i % 2 ? '#f7bebc' : '#eaa4ac') : i % 2 ? '#96b054' : '#a6ba62',
      [Math.sin(a) * r, 1.42 + y * 0.77, Math.cos(a) * r],
      [0.15, 0.093, 0.21],
      [Math.cos(a) * 0.35, a, Math.sin(a) * 0.35],
    )
  }
  const fruit: Record<string, string> = {
    'seed-apple-tree': '#d95449',
    'seed-orange-tree': '#f59d43',
    'seed-peach-tree': '#f4aa95',
    'seed-star-tree': '#ffe181',
  }
  if (fruit[id])
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4
      m.ball(fruit[id], [Math.sin(a) * 0.74, 1.42 + (i % 3) * 0.16, Math.cos(a) * 0.74], [0.104, 0.11, 0.104])
    }
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
export function plant(m: Carving, id: string, stage: number) {
  if (stage === 0) {
    m.ball('#96623d', [0, 0.04, 0], [0.18, 0.09, 0.15])
    m.ball('#dac085', [0.018, 0.114, 0], [0.075, 0.048, 0.045])
    return
  }
  if (stage === 1 || stage === 2) {
    leaves(m, stage === 1 ? 0.27 : 0.55)
    if (stage === 2) m.ball(lime, [0.03, 0.55, 0], [0.086, 0.13, 0.082])
    return
  }
  if (id.endsWith('-tree')) {
    tree(m, id)
    return
  }
  if (/pumpkin|watermelon|carrot|corn|tomato|strawberry/.test(id)) {
    leaves(m, 0.47)
    const color = id.includes('watermelon')
      ? '#67965a'
      : /corn/.test(id)
        ? '#f5c652'
        : /pumpkin|carrot/.test(id)
          ? '#e89442'
          : '#da564a'
    if (id.includes('pumpkin')) {
      for (let i = 0; i < 8; i++)
        m.ball(color, [Math.cos((i * turn) / 8) * 0.14, 0.25, Math.sin((i * turn) / 8) * 0.14], [0.17, 0.21, 0.16])
      m.beam(leaf, [0, 0.41, 0], [0.04, 0.54, 0], 0.045)
    } else if (id.includes('carrot')) m.cone(color, [0, 0.12, 0.07], [0.14, 0.36, 0.14], [Math.PI, 0, 0])
    else
      for (let i = 0; i < (/tomato|strawberry/.test(id) ? 3 : 1); i++) {
        const a = (i * turn) / 3
        m.ball(
          color,
          [0.12 * Math.sin(a), 0.24 + i * 0.065, 0.13 * Math.cos(a)],
          [0.17, id.includes('corn') ? 0.29 : 0.17, 0.15],
        )
      }
    return
  }
  const tall = id.includes('sunflower'),
    h = tall ? 0.9 : id.includes('lotus') ? 0.29 : 0.63
  leaves(m, h)
  const palette: Record<string, string[]> = {
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
  const colors = palette[id] ?? ['#f6c98d', '#f2b4c9']
  if (/tulip|hyacinth|rose|lotus/.test(id)) {
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
    m.ball(tall ? '#71462b' : '#ebad45', [0, h, 0.106], [rad * 0.81, rad * 0.81, 0.115])
    if (tall)
      for (let i = 0; i < 15; i++) {
        const a = i * 2.4,
          r = 0.031 * Math.sqrt(i)
        m.ball('#a97b40', [r * Math.sin(a), h + r * Math.cos(a), 0.202], [0.012, 0.014, 0.011])
      }
  }
}
