import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { addTask, moveTask, updateTask } from '../../db/actions'
import { exceedsRequiredCap } from '../../engine/schedule'
import { CATEGORY_LABEL, CONFIRM_LABEL, EXERCISE_TASK_ID } from '../../data/tasks'
import type { ConfirmMode, TaskCategory, TaskDef, TaskSchedule } from '../../data/types'
import { Modal } from '../../ui/Modal'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

function describeSchedule(s: TaskSchedule): string {
  if (s.kind === 'daily') return '每天'
  const d = [...s.days].sort()
  if (d.join() === '1,2,3,4,5') return '上学日'
  if (d.join() === '0,1,2,3,4') return '上学日前一天'
  return `每周${d.map((x) => WEEK[x]).join('、')}`
}

export function TaskConfigPanel() {
  const { tasks, settings, child } = useStore()
  const [editing, setEditing] = useState<TaskDef | 'new' | null>(null)
  const cap = settings?.requiredCap ?? 6
  if (!child) return null

  return (
    <div className="panel">
      {exceedsRequiredCap(tasks, cap) && (
        <div className="parent-alert">必做任务超过了 {cap} 项。必做太多容易让孩子觉得做不完，建议精简一些。</div>
      )}
      <button className="btn btn-primary" onClick={() => setEditing('new')}>＋ 新增任务</button>
      {tasks.map((t, i) => (
        <div key={t.id} className={`row${t.enabled ? '' : ' disabled'}`}>
          <div className="order-btns">
            <button className="mini" disabled={i === 0} onClick={() => act(() => moveTask(child.id, t.id, -1))} aria-label="上移">▲</button>
            <button className="mini" disabled={i === tasks.length - 1} onClick={() => act(() => moveTask(child.id, t.id, 1))} aria-label="下移">▼</button>
          </div>
          <span className="row-icon">{t.icon}</span>
          <div className="row-main">
            <div className="row-title">{t.name}{t.required && <span className="tag">必做</span>}</div>
            <div className="row-sub">
              {CATEGORY_LABEL[t.category]} · {CONFIRM_LABEL[t.confirmMode]} · {describeSchedule(t.schedule)}
              {t.id !== EXERCISE_TASK_ID && ` · 🪙${t.coins} 💧${t.drops}`}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => setEditing(t)}>编辑</button>
        </div>
      ))}
      {editing && <TaskEditor task={editing === 'new' ? null : editing} onClose={() => setEditing(null)} childId={child.id} />}
    </div>
  )
}

function TaskEditor({ task, onClose, childId }: { task: TaskDef | null; onClose: () => void; childId: string }) {
  const [name, setName] = useState(task?.name ?? '')
  const [icon, setIcon] = useState(task?.icon ?? '⭐')
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'habit')
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(task?.confirmMode ?? 'parent')
  const [days, setDays] = useState<number[]>(task?.schedule.kind === 'weekdays' ? task.schedule.days : [0, 1, 2, 3, 4, 5, 6])
  const [coins, setCoins] = useState(task?.coins ?? 3)
  const [drops, setDrops] = useState(task?.drops ?? 1)
  const [required, setRequired] = useState(task?.required ?? false)
  const [hint, setHint] = useState(task?.hint ?? '')
  const [enabled, setEnabled] = useState(task?.enabled ?? true)
  const isSport = task?.id === EXERCISE_TASK_ID

  const save = async () => {
    const schedule: TaskSchedule = days.length === 7 ? { kind: 'daily' } : { kind: 'weekdays', days: [...days].sort() }
    const data = { name: name.trim(), icon, category, confirmMode, schedule, coins, drops, required, hint: hint.trim() || undefined }
    await act(() => (task ? updateTask(task.id, { ...data, enabled }) : addTask(childId, data)))
    onClose()
  }

  return (
    <Modal wide onClose={onClose}>
      <h2 style={{ fontSize: 28, marginBottom: 12 }}>{task ? '编辑任务' : '新增任务'}</h2>
      {!task && (
        <div className="parent-alert">
          💡 只放需要动力的事。孩子本来就喜欢做的事（比如画画、唱歌）不要放进来——挂上奖励后，撤掉奖励反而可能不做了。
        </div>
      )}
      <div className="form">
        <label>名称<input className="input" value={name} maxLength={12} onChange={(e) => setName(e.target.value)} disabled={isSport} /></label>
        <label>图标（一个 emoji）<input className="input" value={icon} maxLength={4} onChange={(e) => setIcon(e.target.value)} /></label>
        {!isSport && (
          <>
            <label>分类
              <div className="chips">
                {(Object.keys(CATEGORY_LABEL) as TaskCategory[]).filter((c) => c !== 'sport').map((c) => (
                  <button key={c} className={`chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{CATEGORY_LABEL[c]}</button>
                ))}
              </div>
            </label>
            <label>确认方式
              <div className="chips">
                {(['parent', 'self'] as ConfirmMode[]).map((m) => (
                  <button key={m} className={`chip${confirmMode === m ? ' active' : ''}`} onClick={() => setConfirmMode(m)}>{CONFIRM_LABEL[m]}</button>
                ))}
              </div>
            </label>
            <label>奖励
              <div className="chips">
                <Stepper label="🪙" value={coins} onChange={setCoins} />
                <Stepper label="💧" value={drops} onChange={setDrops} />
              </div>
            </label>
          </>
        )}
        <label>哪几天
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
        {!isSport && (
          <label className="check"><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} /> 今日必做（计入全勤）</label>
        )}
        {task && <label className="check"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> 启用</label>}
        <label>达标说明（给家长看）<input className="input" value={hint} maxLength={40} onChange={(e) => setHint(e.target.value)} /></label>
      </div>
      <div className="modal-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
        <button className="btn btn-primary" disabled={!name.trim() || days.length === 0} onClick={save}>保存</button>
      </div>
    </Modal>
  )
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <span className="stepper">
      <button className="mini" onClick={() => onChange(Math.max(0, value - 1))}>－</button>
      <span className="title">{label} {value}</span>
      <button className="mini" onClick={() => onChange(Math.min(20, value + 1))}>＋</button>
    </span>
  )
}
