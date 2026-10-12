import type { Balance } from '../engine/ledger'
import { SvgArt } from './SvgArt'
import './balance.css'

/** 顶部余额：金币和水滴两枚实体小徽章 */
export function BalanceBar({ balance }: { balance: Balance }) {
  return (
    <div className="balance-bar">
      <span className="balance-pill coin" aria-label={`金币 ${balance.coin}`}>
        <span className="balance-token"><SvgArt id="coin" fluid /></span>
        <span className="num" id="coin-target">{balance.coin}</span>
      </span>
      <span className="balance-pill drop" aria-label={`水滴 ${balance.drop}`}>
        <span className="balance-token"><SvgArt id="drop" fluid /></span>
        <span className="num" id="drop-target">{balance.drop}</span>
      </span>
    </div>
  )
}
