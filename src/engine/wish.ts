// 心愿单（5.8）
import type { CatalogItem } from '../data/types'

export interface WishProgress {
  saved: number
  price: number
  /** 0–1 */
  ratio: number
  /** 金币够了 */
  ready: boolean
  short: number
}

export function wishProgress(price: number, coins: number): WishProgress {
  const saved = Math.max(0, Math.min(coins, price))
  return {
    saved,
    price,
    ratio: price > 0 ? saved / price : 1,
    ready: coins >= price,
    short: Math.max(0, price - coins),
  }
}

/** 能设为心愿：要花金币买的物品（免费的特殊装饰靠解锁获得，不能许愿） */
export function canWish(item: CatalogItem): boolean {
  return item.price > 0 && !item.starter
}
