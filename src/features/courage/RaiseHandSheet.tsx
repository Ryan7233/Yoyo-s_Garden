import { useState } from 'react'
import { act, useStore } from '../../app/store'
import type { RaiseResult } from '../../data/types'
import { answerChallenge, recordRaise, type RaiseOutcome } from '../../db/courage'
import { Modal } from '../../ui/Modal'
import { play } from '../../ui/sfx'
import { SunflowerArt } from './SunflowerArt'
import './courage.css'

const CHOICES: { id: RaiseResult; icon: string; label: string }[] = [
  { id: 'right', icon: '✅', label: '答对了' },
  { id: 'wrong', icon: '🤔', label: '答错了' },
  { id: 'notCalled', icon: '🙋', label: '没叫到' },
]

const CHEER: Record<RaiseResult, string> = {
  right: '答对啦！举手说出来，真棒！',
  wrong: '敢举手的人才有机会答错，你很勇敢！',
  notCalled: '举手就是勇敢，下次说不定就叫到你啦！',
}

/** 孩子点“我举手了”：选结果 → 鼓励 → （达标两周后）问要不要挑战 */
export function RaiseHandSheet({ onClose }: { onClose: () => void }) {
  const { child, today } = useStore()
  const [picked, setPicked] = useState<RaiseResult | null>(null)
  const [out, setOut] = useState<RaiseOutcome | null>(null)
  const [asking, setAsking] = useState(false)
  if (!child) return null

  const pick = async (r: RaiseResult) => {
    setPicked(r)
    const o = await act(() => recordRaise(child.id, r, today))
    setOut(o)
    play(o.reachedNow ? 'fanfare' : 'done')
  }

  const answer = async (accept: boolean) => {
    await act(() => answerChallenge(accept, today))
    onClose()
  }

  if (asking) {
    return (
      <Modal onClose={() => answer(false)}>
        <div className="raise-done">
          <SunflowerArt level={2} size={90} />
          <h2 className="modal-title">连续两周都做到了！</h2>
          <p className="modal-text">要不要挑战每周 3 次？不想也没关系，随时可以改回来。</p>
          <div className="modal-actions">
            <button className="btn btn-ghost btn-big" onClick={() => answer(false)}>先不要</button>
            <button className="btn btn-primary btn-big" onClick={() => answer(true)}>要！</button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal onClose={onClose}>
      {!picked ? (
        <>
          <h2 className="modal-title">🙋 今天举手了！结果是？</h2>
          <p className="modal-text">三种都一样棒，选一个就行。</p>
          <div className="raise-choices">
            {CHOICES.map((c) => (
              <button key={c.id} className="btn btn-big raise-choice" onClick={() => pick(c.id)}>
                <span className="raise-icon" aria-hidden>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>
          <div className="modal-actions"><button className="btn btn-ghost" onClick={onClose}>先不记</button></div>
        </>
      ) : (
        <div className={`raise-done result-${picked}`}>
          {/* 答错了：向日葵点头 + 小心心，告诉她答错也很勇敢 */}
          <div className="raise-cheer-art" aria-hidden>
            <span className="raise-sway"><SunflowerArt level={1} size={80} /></span>
            {picked === 'wrong' && ['💛', '🌟', '💛', '✨'].map((h, i) => <span key={i} className={`raise-heart h${i}`}>{h}</span>)}
          </div>
          <h2 className="modal-title">{CHEER[picked]}</h2>
          {out && (
            <>
              <p className="modal-text">
                {out.seed ? '🌻 得到 1 颗勇气种子！' : '今天的勇气种子已经拿到啦，这次也记下了。'}
              </p>
              <p className="modal-text">
                这周举手 <b className="num">{out.weekDays}</b> 天{out.weekDays < out.goal ? `，目标 ${out.goal} 天` : '，这周的目标做到了！'}
              </p>
              {out.reachedNow && <p className="raise-grow pop">{out.grew ? `🌻 花园里的勇气向日葵${out.grew.from ? '又长高了' : '长出来了'}！` : '🌻 勇气向日葵又攒了一周的阳光！'}</p>}
            </>
          )}
          <div className="modal-actions">
            <button className="btn btn-primary btn-big" disabled={!out} onClick={() => (out?.askChallenge ? setAsking(true) : onClose())}>好的</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
