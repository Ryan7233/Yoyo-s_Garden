import type { ExerciseDef } from './types'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export const DEFAULT_EXERCISES: ExerciseDef[] = [
  { id: 'jump-rope', name: '跳绳', icon: '🪢', unit: 'count', timer: 'countdown60', target: 100, days: ALL_DAYS },
  { id: 'sit-reach', name: '坐位体前屈', icon: '🙆', unit: 'cm', timer: 'none', target: null, days: ALL_DAYS, tip: '家长不要从背后按压' },
  { id: 'plank', name: '平板支撑', icon: '🧘', unit: 'seconds', timer: 'stopwatch', target: 30, days: ALL_DAYS, tip: '塌腰或撅屁股就停，不硬撑' },
  { id: 'hang', name: '悬垂', icon: '🤸', unit: 'seconds', timer: 'stopwatch', target: null, days: ALL_DAYS, tip: '双手握杠，脚离地' },
  { id: 'sit-up', name: '仰卧起坐', icon: '💪', unit: 'count', timer: 'countdown60', target: null, days: ALL_DAYS, tip: '双手交叉放胸前，不抱头拉脖子' },
]

export const UNIT_LABEL: Record<ExerciseDef['unit'], string> = {
  count: '个',
  seconds: '秒',
  cm: '厘米',
}
