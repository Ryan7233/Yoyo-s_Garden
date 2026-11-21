// 提前录好的英文录音（Ava）：按句子一个个接着放。清单 src/data/enAudio.json 由 npm run audio:en 生成。
import manifest from '../data/enAudio.json'
import { audioChunks, audioKey } from './enAudioKey'
import { audioContext } from './sfx'

const HAVE = new Set<string>(manifest.keys)
const GAP_MS = 180

/** 这段话每一句都有录音就返回它们的文件名，缺一句就返回 null（整段交给 iPad 声音，免得两种声音混着） */
export function clipKeys(text: string, have: ReadonlySet<string> = HAVE): string[] | null {
  const keys = audioChunks(text).map(audioKey)
  return keys.length > 0 && keys.every((k) => have.has(k)) ? keys : null
}

export const clipUrl = (key: string) => `${import.meta.env.BASE_URL}audio/en/${key}.mp3`

// 用 Web Audio 放（和音效同一个，点按时已解锁）：整文件 fetch 下来能被离线缓存存住，
// 不像 <audio> 在 iPad 上按分段请求、走缓存时容易放不出来。解码过的留在内存里，点第二次不用再解。
const decoded = new Map<string, Promise<AudioBuffer>>()
let playing: AudioBufferSourceNode[] = []
let token = 0

function load(ctx: AudioContext, key: string): Promise<AudioBuffer> {
  let p = decoded.get(key)
  if (!p) {
    p = fetch(clipUrl(key))
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.arrayBuffer()
      })
      .then((b) => ctx.decodeAudioData(b))
    p.catch(() => decoded.delete(key))
    decoded.set(key, p)
  }
  return p
}

export function stopClips() {
  token++
  for (const s of playing) {
    try {
      s.stop()
    } catch {
      /* 已经停了 */
    }
  }
  playing = []
}

/** 依次放这几句，句间停一下；有一句取不到或解不开（离线没缓存到之类）就整段交给 fallback */
export function playClips(keys: string[], fallback: () => void) {
  stopClips()
  const my = token
  const ctx = audioContext()
  if (!ctx) {
    fallback()
    return
  }
  // iPad 静音键打开时 Web Audio 默认不出声；设成 playback 让朗读照样能听到
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
  } catch {
    /* 老系统没有 */
  }
  Promise.all(keys.map((k) => load(ctx, k))).then(
    (buffers) => {
      if (my !== token) return
      let at = ctx.currentTime + 0.03
      for (const b of buffers) {
        const src = ctx.createBufferSource()
        src.buffer = b
        src.connect(ctx.destination)
        src.start(at)
        playing.push(src)
        at += b.duration + GAP_MS / 1000
      }
    },
    () => {
      if (my === token) fallback()
    },
  )
}
