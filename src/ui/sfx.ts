// 原创合成音效：木琴、铃铛一类的清脆短音（SPEC 7.3、7.4）。不用素材文件，离线也能响。
// 家长在设置里关掉“音效”后全部静音；运动计时器的提示音和语音是功能提示，不受这个开关影响。
import { useStore } from '../app/store'

let ctx: AudioContext | null = null

/** 网页音频不在运行：标准的 suspended，加上 iPad 锁屏 / 切后台 / 来电后 Safari 独有的 interrupted */
export const needsResume = (c: Pick<AudioContext, 'state'>) => (c.state as string) !== 'running'

/**
 * 拿到（必要时新建）网页音频，并在不运行时唤醒它。
 * iPad 要求唤醒发生在点按里：在点按的处理函数里同步调用这个就行。
 */
export function audioContext(): AudioContext | null {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if ((!ctx || ctx.state === 'closed') && AC) ctx = new AC()
    if (ctx && needsResume(ctx)) ctx.resume().catch(() => {})
    return ctx
  } catch {
    return null
  }
}

/** 等 c 真的跑起来（最多 ms 毫秒）：状态是 running，而且时钟在走 */
export async function waitRunning(c: Pick<AudioContext, 'state' | 'currentTime' | 'resume'>, ms = 400): Promise<boolean> {
  const end = Date.now() + ms
  const t0 = c.currentTime
  while (Date.now() < end) {
    if (!needsResume(c) && c.currentTime > t0) return true
    await new Promise((r) => setTimeout(r, 25))
  }
  return !needsResume(c) && c.currentTime > t0
}

/**
 * 播放前确保网页音频能用：先唤醒；等不到就当旧的已经被 iPad 废掉，关掉换一个新的再等一次。
 * 还不行返回 null，调用方改用 iPad 声音读（新的那个会在下一次点按时被唤醒）。
 */
export async function readyAudioContext(ms = 400): Promise<AudioContext | null> {
  const c = audioContext()
  if (!c) return null
  if (await waitRunning(c, ms)) return c
  if (ctx === c) {
    try {
      void c.close()
    } catch {
      /* 已经关了 */
    }
    ctx = null
  }
  const fresh = audioContext()
  return fresh && (await waitRunning(fresh, ms)) ? fresh : null
}

/**
 * 每次点按都检查一下：锁屏、切后台、屏幕使用时间弹窗以后网页音频会被挂起，
 * 下一次点任何地方就把它唤醒；回到前台时也试一次（iPad 不一定允许，点按那一下兜底）。
 */
export function installAudioUnlock() {
  window.addEventListener('pointerdown', () => {
    if (!ctx || needsResume(ctx)) audioContext()
  }, { capture: true, passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx && needsResume(ctx)) ctx.resume().catch(() => {})
  })
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
