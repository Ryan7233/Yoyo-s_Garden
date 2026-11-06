// 自动更新的时机：小花园刚打开、刚切回前台的一小会儿里，孩子还没开始做事，这时换新版本不会打断她。

/** 打开 / 切回前台后多久之内发现新版本，就直接换上 */
export const AUTO_UPDATE_WINDOW_MS = 20_000

/**
 * 有新版本时现在要不要换：
 * - 刚打开或刚切回前台（窗口期内），并且没有弹窗开着（没在做任务、默写、看课），就换
 * - 否则先不动，等下次切回前台再换；家长模式里也还能手动点更新
 */
export function shouldAutoUpdate({ sinceShownMs, busy }: { sinceShownMs: number; busy: boolean }): boolean {
  return !busy && sinceShownMs <= AUTO_UPDATE_WINDOW_MS
}
