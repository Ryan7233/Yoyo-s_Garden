// 访客（6.4）：出现与否只看条件，不靠随机数

export type VisitorCondition =
  | { kind: 'bloomingFlowers'; count: number }
  | { kind: 'hasItem'; itemIds: string[] }
  | { kind: 'maturePlant'; plantIds: string[] }
  | { kind: 'all'; conditions: VisitorCondition[] }
  | { kind: 'any'; conditions: VisitorCondition[] }
  | { kind: 'veggieHarvests'; count: number }
  | { kind: 'outdoorDecorCount'; count: number }

export interface VisitorDef {
  id: string
  icon: string
  name: string
  scene: 'outdoor' | 'indoor'
  condition: VisitorCondition
  line: string
  /** 图鉴里给孩子的提示 */
  hint: string
}

export const VISITORS: VisitorDef[] = [
  { id: 'butterfly', icon: '🦋', name: '蝴蝶', scene: 'outdoor', condition: { kind: 'bloomingFlowers', count: 3 }, line: '好多花呀，我能停一会儿吗？', hint: '同时有 3 株开花的花' },
  {
    id: 'bird', icon: '🐦', name: '小鸟', scene: 'outdoor',
    condition: { kind: 'any', conditions: [{ kind: 'hasItem', itemIds: ['out-birdhouse'] }, { kind: 'maturePlant', plantIds: ['seed-sunflower'] }] },
    line: '叽叽！向日葵的种子真香！', hint: '有鸟屋，或有成熟的向日葵',
  },
  {
    id: 'bee', icon: '🐝', name: '蜜蜂', scene: 'outdoor',
    condition: { kind: 'all', conditions: [{ kind: 'hasItem', itemIds: ['out-beehive'] }, { kind: 'bloomingFlowers', count: 1 }] },
    line: '嗡嗡，我来采蜜啦！', hint: '有蜂箱，还有开花的花',
  },
  { id: 'ladybug', icon: '🐞', name: '瓢虫', scene: 'outdoor', condition: { kind: 'veggieHarvests', count: 5 }, line: '你种的菜真好吃（偷偷说）。', hint: '累计收获蔬果 5 次' },
  { id: 'rabbit', icon: '🐰', name: '小兔', scene: 'outdoor', condition: { kind: 'maturePlant', plantIds: ['seed-carrot'] }, line: '胡萝卜！我最喜欢胡萝卜！', hint: '有成熟的胡萝卜' },
  { id: 'frog', icon: '🐸', name: '青蛙', scene: 'outdoor', condition: { kind: 'hasItem', itemIds: ['out-pond'] }, line: '呱呱，这个池塘真舒服。', hint: '有池塘' },
  { id: 'squirrel', icon: '🐿️', name: '松鼠', scene: 'outdoor', condition: { kind: 'maturePlant', plantIds: ['seed-apple-tree', 'seed-orange-tree', 'seed-peach-tree'] }, line: '果子熟了，我能尝一个吗？', hint: '有成熟的果树' },
  { id: 'hedgehog', icon: '🦔', name: '刺猬', scene: 'outdoor', condition: { kind: 'outdoorDecorCount', count: 10 }, line: '你的花园好漂亮，我要住下来！', hint: '户外装饰摆 10 件以上' },
  { id: 'cat', icon: '🐱', name: '小猫', scene: 'indoor', condition: { kind: 'hasItem', itemIds: ['in-sofa', 'in-rug'] }, line: '喵～这里好软好暖和。', hint: '小屋里有沙发或地毯' },
]
