import { useState } from 'react'
import { useStore, act } from '../../app/store'
import type { ExerciseConfig } from '../../db/schema'
import { updateExercise } from '../../db/exercise'
import { UNIT_LABEL } from '../../data/exercises'
import { parseExerciseValue, personalBestOf, suggestRaiseTarget } from '../../engine/exercise'
import { formatDay } from '../../engine/taskDay'
import { formatValue, targetText } from '../tasks/Exercise'
import { Modal } from '../../ui/Modal'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const WITNESS: Record<string, string> = { parent: '👀 家长见证', video: '📹 视频' }
const STATUS: Record<string, string> = { pending: '⏳ 视频待确认', rejected: '纪录被驳回', revoked: '已撤销' }

/** 运动目标：每个子项的目标值和频率；查看历史和个人纪录 */
export function ExerciseConfigPanel() {
  const { exercises, exerciseRecords } = useStore()
  const [editing, setEditing] = useState<ExerciseConfig | null>(null)
  const [history, setHistory] = useState<ExerciseConfig | null>(null)

  return (
    <div className="panel">
      <p className="row-sub">日常练习孩子自己记、直接到账；目标只由家长调整。“首周测基线后设定”的项目可以先空着，过一周看历史再定。</p>
      {exercises.map((d) => {
        const pb = personalBestOf(exerciseRecords, d.id)
        const raise = suggestRaiseTarget(d, exerciseRecords)
        return (
          <div key={d.id} className="row">
            <span className="row-icon">{d.icon}</span>
            <div className="row-main">
              <div className="row-title">{d.name}</div>
              <div className="row-sub">
                {targetText(d)} · 🏆 {pb === null ? '暂无纪录' : formatValue(d, pb)} · {d.days.length === 7 ? '每天' : d.days.length ? d.days.map((x) => `周${WEEK[x]}`).join(' ') : '不安排'}
              </div>
              {raise && <div className="row-sub">💡 最近 3 天都达标了，可以考虑提高目标</div>}
            </div>
            <button className="btn btn-ghost" onClick={() => setHistory(d)}>历史</button>
            <button className="btn btn-primary" onClick={() => setEditing(d)}>设置</button>
          </div>
        )
      })}
      {editing && <ExerciseEditor def={editing} onClose={() => setEditing(null)} />}
      {history && (
        <Modal wide onClose={() => setHistory(null)}>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>{history.icon} {history.name} 历史</h2>
          <HistoryList def={history} />
          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => setHistory(null)}>关闭</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function HistoryList({ def }: { def: ExerciseConfig }) {
  const { exerciseRecords, today } = useStore()
  const list = exerciseRecords.filter((r) => r.exerciseId === def.id).slice().reverse().slice(0, 60)
  if (!list.length) return <p className="empty">还没有记录</p>
  return (
    <div className="panel">
      {list.map((r) => (
        <div key={r.id} className={`row${r.status === 'revoked' ? ' disabled' : ''}`}>
          <div className="row-main">
            <div className="row-title">
              {formatValue(def, r.value)}
              {r.isPersonalBest && <span className="tag">🏆 纪录</span>}
            </div>
            <div className="row-sub">
              {formatDay(r.date, today)}
              {r.witness ? ` · ${WITNESS[r.witness]}` : ''}
              {STATUS[r.status] ? ` · ${STATUS[r.status]}` : ''}
              {r.note ? ` · ${r.note}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExerciseEditor({ def, onClose }: { def: ExerciseConfig; onClose: () => void }) {
  const [target, setTarget] = useState(def.target === null ? '' : String(def.target))
  const [days, setDays] = useState<number[]>(def.days)
  const parsed = target.trim() === '' ? null : parseExerciseValue(target, def.unit)
  const invalid = target.trim() !== '' && parsed === null

  const save = async () => {
    await act(() => updateExercise(def.id, { target: parsed, days: [...days].sort() }))
    onClose()
  }

  return (
    <Modal wide onClose={onClose}>
      <h2 style={{ fontSize: 28, marginBottom: 12 }}>{def.icon} {def.name}</h2>
      <div className="form">
        <label>目标（{UNIT_LABEL[def.unit]}，留空表示还没定）
          <input className="input" inputMode={def.unit === 'cm' ? 'decimal' : 'numeric'} value={target} maxLength={5} onChange={(e) => setTarget(e.target.value)} />
        </label>
        {invalid && <div className="row-sub">请输入合理的数值{def.unit === 'cm' ? '（-50 到 50，可以带一位小数）' : ''}</div>}
        <label>哪几天安排
          <div className="chips">
            {WEEK.map((w, d) => (
              <button
                key={d}
                className={`chip${days.includes(d) ? ' active' : ''}`}
                onClick={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d])}
              >
                周{w}
              </button>
            ))}
          </div>
        </label>
        {days.length === 0 && <div className="row-sub">一天都不选，这一项就不会出现在孩子的运动打卡里</div>}
      </div>
      <div className="modal-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
        <button className="btn btn-primary" disabled={invalid} onClick={save}>保存</button>
      </div>
    </Modal>
  )
}
