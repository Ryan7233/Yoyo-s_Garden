/**
 * 每日拼读：老师发的拼读小卡片图片，放在 public/pinyin/ 下，按日期只在那一天弹出。
 * 换图：把图放进 public/pinyin/，在下面加一行（旧的可以删掉，图也一起删）。
 */
export interface PinyinCard {
  date: string
  title: string
  /** public 下的路径 */
  image: string
}

export const PINYIN_CARDS: PinyinCard[] = [
  { date: '2026-11-03', title: '第 11–12 天 · ao ou iu', image: 'pinyin/2026-11-03.jpg' },
]

export function pinyinCardFor(today: string): PinyinCard | undefined {
  return PINYIN_CARDS.find((c) => c.date === today)
}

export function pinyinImageUrl(card: PinyinCard): string {
  return import.meta.env.BASE_URL + card.image
}

/** 65 → “1分05秒”，和卡片上的写法一样 */
export function formatReadTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m ? `${m}分${String(s).padStart(2, '0')}秒` : `${s}秒`
}
