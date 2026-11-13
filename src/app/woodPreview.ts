export const woodDemo = typeof location !== 'undefined' && new URLSearchParams(location.search).has('wood-demo')
export function gardenLocalKey(key: string) {
  return (woodDemo ? 'wood-demo:' : 'little-garden:') + key
}
