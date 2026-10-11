import type { Balance } from '../engine/ledger'
import './balance.css'

export function BalanceBar({ balance }: { balance: Balance }) {
  return (
    <div className="balance-bar">
      <span className="balance-pill coin" aria-label={`金币 ${balance.coin}`}>
        <span className="balance-icon">🪙</span>
        <span className="title" id="coin-target">{balance.coin}</span>
      </span>
      <span className="balance-pill drop" aria-label={`水滴 ${balance.drop}`}>
        <span className="balance-icon">💧</span>
        <span className="title">{balance.drop}</span>
      </span>
    </div>
  )
}
