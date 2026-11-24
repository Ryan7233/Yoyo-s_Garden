import { useState } from 'react'
import type { MathHomework } from '../../data/mathHomework'
import { Modal } from '../../ui/Modal'
import './math.css'
import { DayChips, type DayPick } from '../../ui/DayChips'

/**
 * 当天的数学作业卡：老师的要求、去课本哪儿找，每一类问题给一句可以照着说的话。
 * 每说出一个问题点一下打勾，全都提过了才能交作业（onFinish 为空时只是再看一遍）。
 */
export function MathHomeworkSheet({ homework, days, onFinish, onClose }: { homework: MathHomework; days?: DayPick; onFinish?: () => Promise<unknown>; onClose: () => void }) {
  const [said, setSaid] = useState<boolean[]>(() => homework.prompts.map(() => false))
  const left = said.filter((s) => !s).length

  return (
    <Modal wide onClose={onClose}>
      <div className="math-hw">
        <h2 className="modal-title">🔢 {!days || days.current === days.today ? '今天的数学' : '数学'} · {homework.title}</h2>
        {days && <DayChips {...days} />}
        <p className="math-teacher">👩‍🏫 老师说：{homework.teacher}</p>
        <p className="math-where">📖 {homework.where}</p>

        <ol className="math-prompts">
          {homework.prompts.map((p, i) => (
            <li key={p.kind} className={`card math-prompt${said[i] ? ' said' : ''}`}>
              <div className="math-kind">
                <span className="title">{p.kind}</span>
                <span className="hint">{p.means}</span>
              </div>
              <p className="math-ask">{p.ask}</p>
              <p className="num math-shape" aria-label="算式">{p.shape}</p>
              <button
                className={`btn btn-big ${said[i] ? 'btn-ghost' : 'btn-primary'}`}
                aria-pressed={said[i]}
                onClick={() => setSaid(said.map((s, k) => (k === i ? !s : s)))}
              >
                {said[i] ? (homework.button?.done ?? '✓ 我提过了') : (homework.button?.todo ?? '我提了一个')}
              </button>
            </li>
          ))}
        </ol>

        <div className="modal-actions">
          {onFinish ? (
            <button
              className="btn btn-primary btn-big"
              disabled={left > 0}
              onClick={async () => {
                await onFinish()
                onClose()
              }}
            >
              {left > 0 ? `还差 ${left} ${homework.button?.left ?? '个问题'}` : homework.button ? '✋ 都说好了，交给爸爸妈妈' : '✋ 都提好了，交给爸爸妈妈'}
            </button>
          ) : (
            <button className="btn btn-primary btn-big" onClick={onClose}>看完了</button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
        </div>
      </div>
    </Modal>
  )
}
