import { FLOWER_IDS, FRUIT_TREE_IDS, VEGGIE_IDS } from './plants'

/** 匹配一类东西：装饰或植物的 catalogId；mature 表示植物要长成（开花、结果） */
export interface ThingMatcher {
  ids: string[]
  mature?: boolean
  /** 提示里怎么叫它，比如“开花的花” */
  label: string
}

export interface ComboDef {
  id: string
  icon: string
  name: string
  a: ThingMatcher
  b: ThingMatcher
  /** 组成后小动物说的话 / 图鉴里的描述 */
  line: string
}

const BLOOMING: ThingMatcher = { ids: FLOWER_IDS, mature: true, label: '开花的花' }
const TREES: ThingMatcher = { ids: ['out-big-tree', ...FRUIT_TREE_IDS, 'seed-cherry-tree', 'seed-pine-tree'], label: '大树或果树' }

// 两样东西挨着放（上下左右、斜角都算）就组成组合
export const COMBOS: ComboDef[] = [
  { id: 'sweet-field', icon: '🍯', name: '甜蜜花田', a: { ids: ['out-beehive'], label: '蜂箱' }, b: BLOOMING, line: '蜜蜂不用飞远，就能采到花蜜啦。' },
  { id: 'bird-home', icon: '🐦', name: '小鸟之家', a: { ids: ['out-birdhouse'], label: '鸟屋' }, b: TREES, line: '鸟屋挂在树边，小鸟住得最安心。' },
  { id: 'veggie-guard', icon: '🥕', name: '守护菜园', a: { ids: ['out-scarecrow'], label: '稻草人' }, b: { ids: VEGGIE_IDS, label: '蔬菜' }, line: '稻草人站岗，菜园安安全全。' },
  { id: 'shady-bench', icon: '🪑', name: '树荫长椅', a: { ids: ['out-bench'], label: '长椅' }, b: TREES, line: '坐在树荫下歇一歇，好凉快。' },
  { id: 'night-path', icon: '💡', name: '夜晚小路', a: { ids: ['out-street-lamp'], label: '路灯' }, b: { ids: ['out-path'], label: '石板小路' }, line: '天黑了，路灯照亮回家的小路。' },
  { id: 'pond-flowers', icon: '🪷', name: '池边花丛', a: { ids: ['out-pond'], label: '池塘' }, b: BLOOMING, line: '花儿照着池塘的水，像镜子一样。' },
  { id: 'picnic-time', icon: '🧺', name: '野餐时光', a: { ids: ['out-picnic'], label: '野餐篮' }, b: { ids: ['out-parasol', ...TREES.ids], label: '遮阳伞或大树' }, line: '在阴凉里野餐，最舒服啦。' },
]
