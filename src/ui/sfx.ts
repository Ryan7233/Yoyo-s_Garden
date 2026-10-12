// 原创合成音效：木琴、铃铛一类的清脆短音（SPEC 7.3、7.4）。不用素材文件，离线也能响。
// 家长在设置里关掉“音效”后全部静音；运动计时器的提示音和语音是功能提示，不受这个开关影响。
import { useStore } from '../app/store'

let ctx: AudioContext | null = null

/** iPad Safari 要求第一次发声发生在点按里：启动时挂一次全局点按，解锁音频 */
export function audioContext(): AudioContext | null {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!ctx && AC) ctx = new AC()
    // iPad 上录完视频、锁屏回来后是 'interrupted'（不只是 'suspended'），也要在点按里恢复
    if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function installAudioUnlock() {
  // 一直挂着：音频被系统打断（录视频、锁屏、来电）后，下一次点按就能恢复；
  // 很多音效在数据库写完后才播，那时已不在点按里，Safari 不允许在那里恢复
  window.addEventListener('pointerdown', () => audioContext())
}

type Wave = OscillatorType

/** 一个音：木琴（triangle，快衰减）或铃铛（sine + 泛音，慢衰减） */
export function note(freq: number, at: number, dur: number, opts: { wave?: Wave; gain?: number; bell?: boolean } = {}) {
  const c = audioContext()
  if (!c) return
  const t = c.currentTime + at
  const out = c.createGain()
  out.gain.setValueAtTime(0.0001, t)
  out.gain.exponentialRampToValueAtTime(opts.gain ?? 0.25, t + 0.01)
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  out.connect(c.destination)
  const partials = opts.bell ? [[1, 1], [2.76, 0.3], [5.4, 0.12]] : [[1, 1], [4, 0.08]]
  for (const [mul, g] of partials) {
    const o = c.createOscillator()
    const og = c.createGain()
    o.type = opts.wave ?? (opts.bell ? 'sine' : 'triangle')
    o.frequency.setValueAtTime(freq * mul, t)
    og.gain.value = g
    o.connect(og).connect(out)
    o.start(t)
    o.stop(t + dur + 0.05)
  }
}

const N: Record<string, number> = {
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760, B6: 1975.53, C7: 2093, E7: 2637.02,
}
const seq = (notes: string[], step: number, dur = 0.35, bell = false) => () =>
  notes.forEach((n, i) => note(N[n], i * step, dur, { bell }))

export const SOUNDS = {
  /** 完成任务 */
  done: seq(['C6', 'E6', 'G6'], 0.08, 0.4),
  /** 金币到账：叮 */
  coin: seq(['B6', 'E7'], 0.07, 0.5, true),
  /** 浇水：一滴水 */
  water: () => {
    const c = audioContext()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    const t = c.currentTime
    o.type = 'sine'
    o.frequency.setValueAtTime(1400, t)
    o.frequency.exponentialRampToValueAtTime(500, t + 0.15)
    g.gain.setValueAtTime(0.25, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    o.connect(g).connect(c.destination)
    o.start(t)
    o.stop(t + 0.25)
  },
  /** 植物长大一阶 */
  grow: seq(['C5', 'E5', 'G5', 'C6'], 0.09, 0.35),
  /** 收获 */
  harvest: seq(['G5', 'C6', 'E6', 'G6'], 0.07, 0.45, true),
  /** 买东西 */
  buy: seq(['E6', 'G6'], 0.09, 0.35),
  /** 小动物 */
  visitor: seq(['A6', 'F6', 'A6'], 0.06, 0.18),
  /** 解锁、心愿实现、新纪录 */
  fanfare: seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.08, 0.5, true),
  /** 唱歌角：一小段原创旋律 */
  song: () => {
    const melody: [string, number][] = [
      ['E5', 1], ['G5', 1], ['A5', 1], ['G5', 1], ['E5', 1], ['D5', 1], ['C5', 2],
      ['D5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['D5', 2], ['C5', 2],
    ]
    let t = 0
    for (const [n, beats] of melody) {
      note(N[n], t, 0.25 * beats + 0.2)
      t += 0.22 * beats
    }
  },
} as const

export type SoundName = keyof typeof SOUNDS

/** 播放一个音效（音效关闭时什么都不做） */
export function play(name: SoundName) {
  if (useStore.getState().settings?.sound === false) return
  try {
    SOUNDS[name]()
  } catch {
    /* 不支持音频时静默 */
  }
}
