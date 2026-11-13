/** 所有平面场景共用存档的行、列和占格尺寸。 */
export function gridCell(x: number, y: number, w = 1, h = 1) {
  return { gridColumn: `${x + 1} / span ${w}`, gridRow: `${y + 1} / span ${h}` }
}
