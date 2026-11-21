// 提前录好的英文录音（Ava）：按句子一个个接着放。清单 src/data/enAudio.json 由 npm run audio:en 生成。
import manifest from '../data/enAudio.json'
import { audioChunks, audioKey } from './enAudioKey'

const HAVE = new Set<string>(manifest.keys)
const GAP_MS = 180

/** 这段话每一句都有录音就返回它们的文件名，缺一句就返回 null（整段交给 iPad 声音，免得两种声音混着） */
export function clipKeys(text: string, have: ReadonlySet<string> = HAVE): string[] | null {
  const keys = audioChunks(text).map(audioKey)
  return keys.length > 0 && keys.every((k) => have.has(k)) ? keys : null
}

export const clipUrl = (key: string) => `${import.meta.env.BASE_URL}audio/en/${key}.mp3`

// 一直用同一个 audio：iPad 上它在第一次点按里放过之后，后面接着放下一句才不会被拦
let el: HTMLAudioElement | null = null
let token = 0
let timer: number | undefined

export function stopClips() {
  token++
  window.clearTimeout(timer)
  if (el && !el.paused) el.pause()
}

/** 依次放这几句；第一句就放不出来（离线没缓存到之类）时调用 fallback */
export function playClips(keys: string[], fallback: () => void) {
  stopClips()
  const my = token
  try {
    el ??= new Audio()
  } catch {
    fallback()
    return
  }
  const audio = el
  let fell = false
  const fail = () => {
    if (fell || my !== token) return
    fell = true
    fallback()
  }
  const playAt = (i: number) => {
    if (my !== token) return
    if (i >= keys.length) return
    audio.onended = () => {
      timer = window.setTimeout(() => playAt(i + 1), GAP_MS)
    }
    audio.onerror = () => {
      if (i === 0) fail()
    }
    audio.src = clipUrl(keys[i])
    audio.play().catch((e: unknown) => {
      // 被下一次点按打断（AbortError）不算失败
      if (i === 0 && (e as Error)?.name !== 'AbortError') fail()
    })
  }
  playAt(0)
}
