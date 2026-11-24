import { addDays } from '../engine/taskDay'

/** 最近 days 天（含今天）里有内容的日期，新的在前：错过的课可以回看（只看、只练，不改哪天交哪课） */
export function recentDates(items: readonly { date: string }[], today: string, days = 7): string[] {
  const from = addDays(today, 1 - days)
  return [...new Set(items.map((i) => i.date).filter((d) => d >= from && d <= today))].sort().reverse()
}
