import { useState } from 'react'
import { act, useStore } from '../../app/store'
import { setRaiseGoal } from '../../db/courage'
import {
  RAISE_GOAL_CHALLENGE, RAISE_GOAL_DEFAULT, SUNFLOWER_LEVELS, courageSeeds, raiseDaysInWeek, sunflowerLevel,
} from '../../engine/courage'
import { HOUSE_RECT } from '../../engine/plots'
import { Modal } from '../../ui/Modal'
import { cell } from '../garden/GardenScene'
import { SunflowerArt } from './SunflowerArt'
import './courage.css'

/** 花园里的勇气向日葵：长在小屋左下角（和小屋占同一块地方，不占地块）。还没达标过就不显示 */
export function CourageSunflower() {
  const { settings } = useStore()
  const [open, setOpen] = useState(false)
  const level = sunflowerLevel(settings?.courageWeeks?.length ?? 0)
  if (!level) return null
  return (
    <>
      <div className="courage-spot" style={cell(HOUSE_RECT.x, HOUSE_RECT.y, HOUSE_RECT.w, HOUSE_RECT.h)}>
        <button className={`courage-flower lv${level}`} onClick={() => setOpen(true)} aria-label="勇气向日葵">
          <SunflowerArt level={level} />
        </button>
      </div>
      {open && <CourageSheet onClose={() => setOpen(false)} />}
    </>
  )
}

/** 点向日葵：这周举手几天、勇气种子、长到几级；周目标孩子自己可以改 */
export function CourageSheet({ onClose }: { onClose: () => void }) {
  const { settings, handRaises, today } = useStore()
  const goal = settings?.raiseGoal ?? RAISE_GOAL_DEFAULT
  const weeks = settings?.courageWeeks?.length ?? 0
  const level = sunflowerLevel(weeks)
  const days = raiseDaysInWeek(handRaises, today)
  const next = SUNFLOWER_LEVELS.find((n) => n > weeks)
  return (
    <Modal onClose={onClose}>
      <div className="raise-done">
        {level > 0 && <SunflowerArt level={level as 1 | 2 | 3} size={90} />}
        <h2 className="modal-title">🌻 勇气向日葵</h2>
        <p className="modal-text">上课举手就记一次，答对、答错、没叫到都一样棒。每周举手的天数达到目标，向日葵就会长大。</p>
      </div>
      <div className="courage-stats">
        <div><b className="num">{days} / {goal}</b>这周举手</div>
        <div><b className="num">{courageSeeds(handRaises)}</b>勇气种子</div>
        <div><b className="num">{weeks}</b>做到的周</div>
      </div>
      <p className="modal-text">{next ? `再做到 ${next - weeks} 周，向日葵会长得更高。` : '向日葵已经长到最高啦！'}</p>
      <p className="modal-text">每周目标：</p>
      <div className="chips courage-goal">
        {[RAISE_GOAL_DEFAULT, RAISE_GOAL_CHALLENGE].map((g) => (
          <button key={g} className={`chip${goal === g ? ' active' : ''}`} onClick={() => act(() => setRaiseGoal(g))}>每周 {g} 天</button>
        ))}
      </div>
      <div className="modal-actions"><button className="btn btn-primary" onClick={onClose}>好的</button></div>
    </Modal>
  )
}
