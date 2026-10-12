import { SvgArt } from './SvgArt'

/** 金币和水滴的小数字牌（和顶部余额徽章同一套图形） */
export function Reward({ coins, drops, size = 'm' }: { coins?: number; drops?: number; size?: 's' | 'm' | 'l' }) {
  return (
    <span className={`reward reward-${size}`}>
      {!!coins && (
        <span className="reward-item coin">
          <SvgArt id="coin" fluid />
          <span className="num">{coins}</span>
        </span>
      )}
      {!!drops && (
        <span className="reward-item drop">
          <SvgArt id="drop" fluid />
          <span className="num">{drops}</span>
        </span>
      )}
    </span>
  )
}
