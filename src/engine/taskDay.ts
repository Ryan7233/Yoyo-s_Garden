// 任务日与日界线：按 iPad 系统时间 00:00 切日（SPEC 4.5）

const pad = (n: number) => String(n).padStart(2, '0')

/** 把一个时刻转成它所属的任务日 'YYYY-MM-DD'（本地时区） */
export function toTaskDay(at: Date): string {
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`
}

/** 解析 'YYYY-MM-DD' 为本地时区当天 12:00，避免夏令时边界问题 */
export function parseTaskDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export function addDays(day: string, n: number): string {
  const d = parseTaskDay(day)
  d.setDate(d.getDate() + n)
  return toTaskDay(d)
}

/** 0 = 周日 */
export function weekdayOf(day: string): number {
  return parseTaskDay(day).getDay()
}

/** 这一周的周一（一周从周一算到周日） */
export function weekStart(day: string): string {
  const wd = weekdayOf(day)
  return addDays(day, wd === 0 ? -6 : 1 - wd)
}

/** a - b 相差的天数 */
export function diffDays(a: string, b: string): number {
  return Math.round((parseTaskDay(a).getTime() - parseTaskDay(b).getTime()) / 86_400_000)
}

/** 是否在补录窗口内：今天和前 backfillDays 天 */
export function isEditable(day: string, today: string, backfillDays: number): boolean {
  const d = diffDays(today, day)
  return d >= 0 && d <= backfillDays
}

/** 补录窗口内的日期，从今天往前 */
export function editableDays(today: string, backfillDays: number): string[] {
  return Array.from({ length: backfillDays + 1 }, (_, i) => addDays(today, -i))
}

const WEEK_LABEL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
export function formatDay(day: string, today?: string): string {
  if (today) {
    const d = diffDays(today, day)
    if (d === 0) return '今天'
    if (d === 1) return '昨天'
    if (d === 2) return '前天'
  }
  const [, m, dd] = day.split('-').map(Number)
  return `${m}月${dd}日 ${WEEK_LABEL[weekdayOf(day)]}`
}
