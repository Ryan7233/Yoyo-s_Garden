import * as T from 'three'
import { Carving } from './carving'

const ink = '#382822'
function eye(m: Carving, x: number, y: number, z: number, radius: number) {
  m.ball(ink, [x, y, z], [radius, radius * 1.1, radius * 0.85])
  m.ball(
    '#fff3d3',
    [x - radius * 0.23, y + radius * 0.38, z + radius * 0.69],
    [radius * 0.28, radius * 0.28, radius * 0.18],
  )
}

export function hedgehog(m: Carving) {
  m.ball('#926748', [0, 0.2, -0.065], [0.265, 0.205, 0.323])
  m.ball('#dfb185', [0, 0.175, 0.18], [0.202, 0.157, 0.212])
  m.ball('#ebc29a', [0, 0.143, 0.315], [0.125, 0.093, 0.14])
  m.ball(ink, [0, 0.159, 0.449], [0.048, 0.038, 0.037])
  for (const side of [-1, 1]) {
    eye(m, side * 0.119, 0.237, 0.32, 0.027)
    m.ball('#ab7954', [side * 0.158, 0.29, 0.19], [0.049, 0.062, 0.03], [0.1, side * 0.3, -side * 0.3])
    for (const z of [-0.19, 0.19]) m.ball('#b98864', [side * 0.165, 0.051, z], [0.063, 0.047, 0.081])
  }
  // Stagger small overlapping wooden quills across the dome, stopping at the face.
  for (let row = 0; row < 5; row++) {
    const z = 0.115 - row * 0.099
    const section = Math.sqrt(1 - ((z + 0.065) / 0.345) ** 2)
    const count = row % 2 ? 8 : 7
    for (let i = 0; i < count; i++) {
      const a = (i / (count - 1) - 0.5) * 2.85
      const x = 0.253 * section * Math.sin(a)
      const y = 0.2 + 0.199 * section * Math.cos(a)
      const color = ['#936041', '#aa7953', '#80523c'][(row + i) % 3]
      m.ball(color, [x, y, z], [0.047, 0.11, 0.048], [-0.63 - row * 0.055, 0, -0.76 * a])
    }
  }
}

export function squirrel(m: Carving) {
  const fur = '#be7044',
    cream = '#f5c895'
  // Sweep a single continuous plume through an S bend with a tapered, forward-curling tip.
  const spine = new T.CatmullRomCurve3([
    new T.Vector3(0, 0.13, -0.11),
    new T.Vector3(0.08, 0.23, -0.36),
    new T.Vector3(0.13, 0.47, -0.43),
    new T.Vector3(0.14, 0.73, -0.4),
    new T.Vector3(0.11, 0.83, -0.27),
    new T.Vector3(0.06, 0.77, -0.16),
  ])
  const plume = new T.TubeGeometry(spine, 26, 1, 14, false)
  const positions = plume.getAttribute('position')
  const vertex = new T.Vector3()
  for (let i = 0; i <= 26; i++) {
    const t = i / 26
    const center = spine.getPointAt(t)
    const radius = 0.006 + 0.153 * Math.sin(Math.PI * t) ** 0.7 + 0.029 * (1 - t)
    for (let j = 0; j <= 14; j++) {
      const index = i * 15 + j
      vertex.fromBufferAttribute(positions, index).sub(center).multiplyScalar(radius).add(center)
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z)
    }
  }
  plume.computeVertexNormals()
  const carvedTail = plume.toNonIndexed()
  m.part(carvedTail, '#b4663e', [0, 0, 0], [1, 1, 1])
  carvedTail.dispose()
  plume.dispose()
  m.ball(fur, [0, 0.24, -0.01], [0.18, 0.226, 0.19])
  m.ball(cream, [0, 0.245, 0.122], [0.126, 0.156, 0.091])
  m.ball(fur, [0, 0.468, 0.102], [0.167, 0.151, 0.159])
  m.ball(cream, [0, 0.424, 0.23], [0.095, 0.056, 0.073])
  m.ball(ink, [0, 0.449, 0.293], [0.031, 0.025, 0.023])
  for (const s of [-1, 1]) {
    m.ball(fur, [s * 0.103, 0.594, 0.076], [0.051, 0.086, 0.044], [-0.14, 0, -s * 0.15])
    m.ball('#eaa27c', [s * 0.105, 0.609, 0.106], [0.026, 0.05, 0.017])
    eye(m, s * 0.103, 0.494, 0.218, 0.029)
    m.ball(fur, [s * 0.125, 0.083, 0.092], [0.093, 0.064, 0.147])
    m.ball(fur, [s * 0.091, 0.271, 0.175], [0.045, 0.078, 0.05], [0.47, 0, -s * 0.36])
  }
  m.ball('#ce964f', [0, 0.266, 0.224], [0.068, 0.087, 0.064])
  m.ball('#835338', [0, 0.324, 0.223], [0.077, 0.04, 0.071])
}

export function frog(m: Carving) {
  const green = '#80ab57',
    pale = '#d0d58a'
  m.ball(green, [0, 0.14, -0.043], [0.223, 0.143, 0.236])
  m.ball(pale, [0, 0.155, 0.164], [0.202, 0.097, 0.141])
  m.ball('#93b75a', [0, 0.219, 0.13], [0.243, 0.129, 0.171])
  for (const s of [-1, 1]) {
    m.ball(green, [s * 0.214, 0.105, -0.1], [0.113, 0.096, 0.171], [0, -s * 0.41, 0])
    m.ball('#aac369', [s * 0.252, 0.049, -0.058], [0.069, 0.045, 0.165], [0, s * 0.52, 0])
    m.beam(green, [s * 0.13, 0.166, 0.115], [s * 0.168, 0.045, 0.271], 0.037)
    for (const toe of [-1, 0, 1]) {
      const x = s * (0.17 + toe * 0.04),
        z = 0.324 - Math.abs(toe) * 0.017
      m.beam('#9bbd63', [s * 0.168, 0.044, 0.266], [x, 0.027, z], 0.016)
      m.ball(pale, [x, 0.027, z], [0.022, 0.014, 0.023])
    }
    m.ball(green, [s * 0.138, 0.322, 0.154], [0.089, 0.096, 0.09])
    m.ball('#fff0bd', [s * 0.14, 0.35, 0.201], [0.066, 0.067, 0.052])
    eye(m, s * 0.144, 0.357, 0.24, 0.043)
    m.ball('#d1ad78', [s * 0.176, 0.227, 0.24], [0.037, 0.021, 0.021])
  }
}
