// 运动打卡：五个子项的计时器、数值录入、目标与个人纪录、破纪录见证（SPEC 4.3）
import { useEffect, useRef, useState } from 'react'
import { useStore, act } from '../../app/store'
import type { ExerciseConfig } from '../../db/schema'
import { logExercise, logExerciseWithVideo } from '../../db/exercise'
import { UNIT_LABEL } from '../../data/exercises'
import type { ExerciseRecord } from '../../data/types'
import {
  bestTodayByExercise, canChallengeRecord, COUNTDOWN_SECONDS, countdownLeft, exercisesForDay, formatSeconds,
  parseExerciseValue, personalBestOf, stopwatchSeconds,
} from '../../engine/exercise'
import { Modal } from '../../ui/Modal'
import { Celebrate } from '../../ui/Celebrate'
import { cueEnd, cueStart, cueTick, unlockAudio } from '../../ui/voice'
import { WitnessPin } from '../parent/WitnessPin'
import { play } from '../../ui/sfx'
import './exercise.css'

export function formatValue(def: Pick<ExerciseConfig, 'unit'>, v: number): string {
  return `${v > 0 && def.unit === 'cm' ? '+' : ''}${v} ${UNIT_LABEL[def.unit]}`
}

export function targetText(def: ExerciseConfig): string {
  return def.target === null ? '目标：先测一测' : `目标 ${formatValue(def, def.target)}`
}

/** 运动卡片打开后的面板：今天安排的子项列表，点一项进入计时 */
export function ExerciseSheet({ onClose }: { onClose: () => void }) {
  const { exercises, exerciseRecords, today } = useStore()
  const [running, setRunning] = useState<ExerciseConfig | null>(null)
  const scheduled = exercisesForDay(exercises, today)
  const best = bestTodayByExercise(exerciseRecords, today)
  const doneCount = scheduled.filter((d) => best.has(d.id)).length

  if (running) return <ExerciseRun def={running} onBack={() => setRunning(null)} />

  return (
    <Modal wide onClose={onClose}>
      <header className="ex-head">
        <h2 className="title" style={{ fontSize: 32 }}>🏃 运动打卡</h2>
        <span className="stat-pill">今天做了 {doneCount} / {scheduled.length} 项</span>
      </header>
      <p className="ex-sub">做了几项记几项，每做一项 🪙2，达到目标再 🪙1，{scheduled.length} 项都做完再得 🪙3 💧2</p>
      {scheduled.length === 0 && <p className="empty">今天休息一天～</p>}
      <div className="ex-grid">
        {scheduled.map((d) => {
          const b = best.get(d.id)
          const pb = personalBestOf(exerciseRecords, d.id)
          return (
            <button key={d.id} className={`ex-card${b ? ' done' : ''}`} onClick={() => setRunning(d)}>
              <span className="ex-icon">{d.icon}</span>
              <span className="ex-name">{d.name}</span>
              <span className="ex-meta">{targetText(d)}</span>
              <span className="ex-meta">🏆 {pb === null ? '还没有纪录' : formatValue(d, pb)}</span>
              {b ? <span className="badge done">✓ 今天 {formatValue(d, b.value)}</span> : <span className="badge todo">去做 ›</span>}
            </button>
          )
        })}
      </div>
      <div className="modal-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onClose}>返回</button>
      </div>
    </Modal>
  )
}

type Phase =
  | { kind: 'ready' }
  | { kind: 'running'; startedAt: number }
  | { kind: 'input' }
  | { kind: 'challenge'; value: number }
  | { kind: 'pin'; value: number }
  | { kind: 'video'; value: number }
  | { kind: 'videoValue'; value: number; video: Blob }
  | { kind: 'result'; record: ExerciseRecord }

/** 尽量让屏幕在计时时不熄灭 */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on) return
    let lock: { release: () => Promise<void> } | null = null
    const nav = navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => void lock?.release().catch(() => {})
  }, [on])
}

function ExerciseRun({ def, onBack }: { def: ExerciseConfig; onBack: () => void }) {
  const { child, today, exerciseRecords } = useStore()
  const [phase, setPhase] = useState<Phase>(def.timer === 'none' ? { kind: 'input' } : { kind: 'ready' })
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const pb = personalBestOf(exerciseRecords, def.id)
  useWakeLock(phase.kind === 'running')
  if (!child) return null

  const unit = UNIT_LABEL[def.unit]

  const submit = (value: number) => {
    if (canChallengeRecord(value, pb)) setPhase({ kind: 'challenge', value })
    else void save(value, 'none')
  }

  const save = async (value: number, witness: 'none' | 'parent') => {
    if (busy) return
    setBusy(true)
    try {
      const record = await act(() => logExercise(child.id, def.id, today, value, witness))
      play(record.isPersonalBest ? 'fanfare' : 'done')
      setPhase({ kind: 'result', record })
    } finally {
      setBusy(false)
    }
  }

  const saveVideo = async (value: number, video: Blob) => {
    if (busy) return
    setBusy(true)
    try {
      const record = await act(() => logExerciseWithVideo(child.id, def.id, today, value, video))
      play('done')
      setPhase({ kind: 'result', record })
    } finally {
      setBusy(false)
    }
  }

  const start = () => {
    unlockAudio()
    cueStart()
    setPhase({ kind: 'running', startedAt: Date.now() })
  }

  const parsed = parseExerciseValue(text, def.unit)

  return (
    <Modal wide>
      <div className="ex-run">
        <header className="ex-head">
          <h2 className="title" style={{ fontSize: 32 }}>{def.icon} {def.name}</h2>
          <span className="stat-pill">{targetText(def)}</span>
          <span className="stat-pill">🏆 {pb === null ? '还没有纪录' : formatValue(def, pb)}</span>
        </header>
        {def.tip && phase.kind !== 'result' && <div className="ex-tip">💡 {def.tip}</div>}

        {phase.kind === 'ready' && (
          <>
            <p className="ex-sub">
              {def.timer === 'countdown60' ? `点“开始”后计时 ${COUNTDOWN_SECONDS} 秒，听到“时间到”就停，然后输入做了几${unit}。` : '点“开始”后计时，坚持不住了就点“停”，秒数会自动记下来。'}
            </p>
            <button className="btn btn-primary ex-go" onClick={start}>开始！</button>
            <button className="btn btn-ghost" onClick={onBack}>返回</button>
          </>
        )}

        {phase.kind === 'running' && def.timer === 'countdown60' && (
          <Countdown startedAt={phase.startedAt} onEnd={() => setPhase({ kind: 'input' })} onCancel={() => setPhase({ kind: 'ready' })} />
        )}
        {phase.kind === 'running' && def.timer === 'stopwatch' && (
          <Stopwatch startedAt={phase.startedAt} onStop={(s) => submit(s)} />
        )}

        {phase.kind === 'input' && (
          <>
            <p className="ex-sub">
              {def.unit === 'cm' ? '指尖超过脚尖是正数，没碰到脚尖是负数（比如 -3）' : `做了几${unit}？`}
            </p>
            <ValueInput def={def} text={text} onChange={setText} />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={def.timer === 'none' ? onBack : () => setPhase({ kind: 'ready' })}>
                {def.timer === 'none' ? '返回' : '重新计时'}
              </button>
              <button className="btn btn-primary" disabled={parsed === null || busy} onClick={() => parsed !== null && submit(parsed)}>记下来</button>
            </div>
          </>
        )}

        {phase.kind === 'challenge' && (
          <>
            <p className="ex-big pop">{formatValue(def, phase.value)}</p>
            <h3 className="title" style={{ fontSize: 28 }}>{pb === null ? '这是你的第一个纪录！' : '比最好纪录还多！'}要挑战纪录吗？</h3>
            <p className="ex-sub">纪录需要有人见证，刷新纪录再得 🪙5</p>
            <div className="ex-choices">
              <button className="btn btn-primary ex-choice" onClick={() => setPhase({ kind: 'pin', value: phase.value })}>👀 喊爸爸妈妈来看</button>
              <button className="btn btn-primary ex-choice" onClick={() => setPhase({ kind: 'video', value: phase.value })}>📹 录一段视频</button>
              <button className="btn btn-ghost ex-choice" disabled={busy} onClick={() => save(phase.value, 'none')}>先不用，照常记录</button>
            </div>
          </>
        )}

        {phase.kind === 'pin' && (
          <>
            <p className="ex-sub">{child.name}这次{def.name}的成绩是 <b>{formatValue(def, phase.value)}</b></p>
            <WitnessPin onPass={() => save(phase.value, 'parent')} onCancel={() => setPhase({ kind: 'challenge', value: phase.value })} />
          </>
        )}

        {phase.kind === 'video' && (
          <>
            <p className="ex-sub">把 iPad 立在旁边，让镜头拍到你，录下再做一次的全过程。爸爸妈妈有空时会看视频确认。</p>
            <label className="btn btn-primary ex-go">
              📹 打开相机
              <input
                type="file"
                accept="video/*"
                capture="user"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (f) {
                    setText(String(phase.value))
                    setPhase({ kind: 'videoValue', value: phase.value, video: f })
                  }
                }}
              />
            </label>
            <button className="btn btn-ghost" onClick={() => setPhase({ kind: 'challenge', value: phase.value })}>返回</button>
          </>
        )}

        {phase.kind === 'videoValue' && (
          <>
            <p className="ex-sub">视频录好啦 ✓ 视频里这一次的成绩是：</p>
            <ValueInput def={def} text={text} onChange={setText} />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setPhase({ kind: 'video', value: phase.value })}>重录</button>
              <button className="btn btn-primary" disabled={parsed === null || busy} onClick={() => parsed !== null && saveVideo(parsed, phase.video)}>交给爸爸妈妈</button>
            </div>
          </>
        )}

        {phase.kind === 'result' && <Result def={def} record={phase.record} onBack={onBack} />}
      </div>
    </Modal>
  )
}

function ValueInput({ def, text, onChange }: { def: ExerciseConfig; text: string; onChange: (s: string) => void }) {
  return (
    <div className="ex-input">
      {def.unit === 'cm' && (
        <button className="btn btn-ghost" onClick={() => onChange(text.startsWith('-') ? text.slice(1) : `-${text}`)} aria-label="切换正负">±</button>
      )}
      <input
        className="input"
        autoFocus
        inputMode={def.unit === 'cm' ? 'decimal' : 'numeric'}
        value={text}
        maxLength={5}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="title">{UNIT_LABEL[def.unit]}</span>
    </div>
  )
}

function useNow(on: boolean) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!on) return
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [on])
  return now
}

function Countdown({ startedAt, onEnd, onCancel }: { startedAt: number; onEnd: () => void; onCancel: () => void }) {
  const now = useNow(true)
  const left = countdownLeft(startedAt, now)
  const lastTick = useRef(COUNTDOWN_SECONDS + 1)
  useEffect(() => {
    if (left === lastTick.current) return
    lastTick.current = left
    if (left === 0) {
      cueEnd()
      onEnd()
    } else if (left <= 3) {
      cueTick()
    }
  }, [left, onEnd])
  return (
    <>
      <div className={`ex-clock${left <= 10 ? ' hurry' : ''}`}>{left}</div>
      <p className="ex-sub">加油！</p>
      <button className="btn btn-ghost" onClick={onCancel}>不做了</button>
    </>
  )
}

function Stopwatch({ startedAt, onStop }: { startedAt: number; onStop: (seconds: number) => void }) {
  const now = useNow(true)
  return (
    <>
      <div className="ex-clock">{formatSeconds(stopwatchSeconds(startedAt, now))}</div>
      <button
        className="btn btn-primary ex-go"
        onClick={() => {
          const s = stopwatchSeconds(startedAt, Date.now())
          cueTick()
          onStop(s)
        }}
      >
        停
      </button>
    </>
  )
}

function Result({ def, record, onBack }: { def: ExerciseConfig; record: ExerciseRecord; onBack: () => void }) {
  const ledger = useStore((s) => s.ledger)
  const got = ledger.filter((e) => e.refId === record.id && e.amount > 0)
  const coins = got.filter((e) => e.currency === 'coin').reduce((s, e) => s + e.amount, 0)
  const drops = got.filter((e) => e.currency === 'drop').reduce((s, e) => s + e.amount, 0)
  const reached = def.target !== null && record.value >= def.target
  return (
    <>
      {coins + drops > 0 && <Celebrate />}
      <p className="ex-big pop">{formatValue(def, record.value)}</p>
      {record.isPersonalBest && <h3 className="title ex-record">🏆 新纪录！</h3>}
      {reached && <p className="ex-sub">🎯 达到目标啦</p>}
      {record.status === 'pending' && <p className="ex-sub">📹 视频已经交给爸爸妈妈，确认后纪录奖励就到账</p>}
      <p className="title" style={{ fontSize: 26 }}>
        {coins + drops > 0 ? `获得 🪙 ${coins}${drops ? ` 💧 ${drops}` : ''}` : '今天这项已经记过奖励啦，多练练也很棒！'}
      </p>
      <button className="btn btn-primary btn-big" onClick={onBack}>好的</button>
    </>
  )
}
