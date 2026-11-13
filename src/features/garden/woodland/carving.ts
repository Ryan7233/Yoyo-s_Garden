import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

type Point = [number, number, number]
const round = new RoundedBoxGeometry(1, 1, 1, 2, 0.09)
const sphere = new T.SphereGeometry(1, 12, 9).toNonIndexed()
const rod = new T.CylinderGeometry(1, 1, 1, 12).toNonIndexed()
const taper = new T.ConeGeometry(1, 1, 12).toNonIndexed()
const ring = new T.TorusGeometry(1, 0.14, 6, 20).toNonIndexed()

/** Bake each toy into one vertex-coloured mesh. All copies share its geometry. */
export class Carving {
  private parts: T.BufferGeometry[] = []
  part(shape: T.BufferGeometry, color: string, pos: Point, size: Point, rotation: Point = [0, 0, 0]) {
    const geo = shape.clone()
    const q = new T.Quaternion().setFromEuler(new T.Euler(...rotation))
    geo.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...pos), q, new T.Vector3(...size)))
    const rgb = new T.Color(color)
    const count = geo.getAttribute('position').count
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) rgb.toArray(colors, i * 3)
    geo.setAttribute('color', new T.BufferAttribute(colors, 3))
    this.parts.push(geo)
  }
  box(c: string, p: Point, s: Point, r?: Point) {
    this.part(round, c, p, s, r)
  }
  ball(c: string, p: Point, s: Point, r?: Point) {
    this.part(sphere, c, p, s, r)
  }
  cone(c: string, p: Point, s: Point, r?: Point) {
    this.part(taper, c, p, s, r)
  }
  ring(c: string, p: Point, s: Point, r?: Point) {
    this.part(ring, c, p, s, r)
  }
  beam(c: string, a: Point, b: Point, radius: number) {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b)
    const dir = end.clone().sub(start)
    const e = new T.Euler().setFromQuaternion(
      new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize()),
    )
    this.part(rod, c, start.lerp(end, 0.5).toArray(), [radius, dir.length(), radius], [e.x, e.y, e.z])
  }
  finish() {
    const result = mergeGeometries(this.parts)!
    for (const g of this.parts) g.dispose()
    return result
  }
}
export const oak = '#ab7049',
  honey = '#d49b61',
  dark = '#694330',
  leaf = '#60904b',
  lime = '#98b654'
export function tint(hex: string, amount: number) {
  return '#' + new T.Color(hex).lerp(new T.Color(amount < 0 ? '#843b49' : '#fff3dc'), Math.abs(amount)).getHexString()
}
