import { describe, expect, it } from 'vitest'
import { along, type Stop } from './world'

describe('along a route', () => {
  // Out, a right-angle turn she does not stop at, and on: 1 unit a second.
  const route: Stop[] = [
    { x: 0, y: 0, z: 0, stay: 1 },
    { x: 1, y: 0, z: 0, stay: 0 },
    { x: 1, y: 0, z: 1, stay: 0 },
    { x: 1, y: 0, z: 2, stay: 1 },
  ]
  it('rounds the corner instead of touching it', () => {
    const corner = along(route, 1, 2)
    expect(corner.x).toBeCloseTo(0.875)
    expect(corner.z).toBeCloseTo(0.125)
    // Halfway round, she faces halfway between the two legs.
    expect(corner.heading).toBeCloseTo(Math.PI / 4)
  })
  it('never jumps and never snaps round', () => {
    let last = along(route, 1, 1.001)
    for (let t = 1.01; t < 3.99; t += 0.01) {
      const now = along(route, 1, t)
      expect(Math.hypot(now.x - last.x, now.z - last.z)).toBeLessThan(0.02)
      expect(Math.abs(now.heading - last.heading)).toBeLessThan(0.05)
      last = now
    }
  })
  it('still stops exactly on the stops it waits at', () => {
    expect(along(route, 1, 0.5)).toMatchObject({ x: 0, z: 0, moving: false })
    expect(along(route, 1, 4.5)).toMatchObject({ x: 1, z: 2, moving: false })
  })
})
