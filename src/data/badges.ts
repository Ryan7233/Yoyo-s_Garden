// 成就徽章（5.7，P1）：全部按累计数判定，拿到就不会再失去

export type BadgeRule =
  | { kind: 'harvests'; count: number }
  | { kind: 'plantedNow'; count: number }
  | { kind: 'codexPlants'; count: number }
  | { kind: 'visitorsMet'; count: number }
  | { kind: 'indoorPlaced'; count: number }
  | { kind: 'personalBests'; count: number }
  | { kind: 'allDoneDays'; count: number }

export interface BadgeDef {
  id: string
  icon: string
  name: string
  desc: string
  rule: BadgeRule
}

export const BADGES: BadgeDef[] = [
  { id: 'first-harvest', icon: '🧺', name: '第一次收获', desc: '收获第一株植物', rule: { kind: 'harvests', count: 1 } },
  { id: 'full-six', icon: '🌱', name: '种满六块地', desc: '同时种着 6 株植物', rule: { kind: 'plantedNow', count: 6 } },
  { id: 'ten-plants', icon: '🌈', name: '小小植物学家', desc: '图鉴里集齐 10 种植物', rule: { kind: 'codexPlants', count: 10 } },
  { id: 'first-visitor', icon: '🐾', name: '第一位客人', desc: '迎来第一位小动物访客', rule: { kind: 'visitorsMet', count: 1 } },
  { id: 'cozy-house', icon: '🏡', name: '温暖小屋', desc: '小屋里摆满 10 件家具', rule: { kind: 'indoorPlaced', count: 10 } },
  { id: 'first-record', icon: '🏆', name: '纪录挑战者', desc: '第一次刷新运动纪录', rule: { kind: 'personalBests', count: 1 } },
  { id: 'first-all-done', icon: '⭐', name: '第一颗星', desc: '第一次完成当天全部必做任务', rule: { kind: 'allDoneDays', count: 1 } },
]
