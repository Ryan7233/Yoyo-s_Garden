// 计时器的语音提示和提示音：要足够响，家长在隔壁也能听到（SPEC 4.3）
// 这是功能提示，不受“音效”开关影响。iPad Safari 要求第一次发声发生在点按里，所以“开始”按钮里先调用 unlockAudio()。
import { audioContext } from './sfx'
import { clipKeys, playClips, stopClips } from './enClips'

export function unlockAudio() {
  audioContext()
}

/** 响亮的提示音：freq 赫兹，持续 ms 毫秒 */
export function beep(freq = 880, ms = 250) {
  const ctx = audioContext()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + ms / 1000)
  } catch {
    /* 忽略 */
  }
}

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.volume = 1
    u.rate = 1
    synth.speak(u)
  } catch {
    /* 不支持语音时只有提示音 */
  }
}

/** 开始：高音一声 + “开始！” */
export function cueStart() {
  beep(988, 300)
  speak('开始！')
}

/** 结束：三声 + “时间到！” */
export function cueEnd() {
  beep(660, 200)
  setTimeout(() => beep(660, 200), 280)
  setTimeout(() => beep(880, 450), 560)
  setTimeout(() => speak('时间到！'), 300)
}

/** 倒数提示：最后 3 秒短促的滴 */
export function cueTick() {
  beep(740, 120)
}

/** 声线里我们关心的几项（方便测试时造假数据） */
export type VoiceLike = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'voiceURI' | 'localService'>

// 想要的声线，靠前的优先：伊顿是美音，默写备用是英音
const PREFERRED: Record<string, string[]> = {
  'en-US': ['Ava', 'Samantha', 'Zoe', 'Allison', 'Susan', 'Evan', 'Nathan', 'Tom'],
  'en-GB': ['Serena', 'Stephanie', 'Kate', 'Daniel', 'Arthur', 'Martha'],
}
// iPad 自带的搞怪声线和 Eloquence 老式声线，不适合给孩子做示范
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i

/** 搞怪声线和老式声线 */
export const isNoveltyVoice = (v: Pick<VoiceLike, 'name'>) => NOVELTY.test(v.name)

/** 音质档位：优质 2 > 增强 1 > 普通 0（iPad 的 voiceURI 形如 com.apple.voice.enhanced.en-US.Samantha） */
export function voiceTier(v: VoiceLike): number {
  const id = `${v.voiceURI} ${v.name}`.toLowerCase()
  if (id.includes('premium') || id.includes('优质')) return 2
  if (id.includes('enhanced') || id.includes('增强')) return 1
  return 0
}

/**
 * 从系统声线里挑最好的：同一口音里先比音质档位，再按常用名字排，再优先本地离线的。
 * 没有这个口音的声线时返回 undefined，交给系统默认。
 */
export function pickVoice(voices: VoiceLike[], lang: string): VoiceLike | undefined {
  const want = lang.toLowerCase().replace('_', '-')
  const names = PREFERRED[lang] ?? []
  const rank = (v: VoiceLike) => {
    const i = names.findIndex((n) => v.name.toLowerCase().startsWith(n.toLowerCase()))
    return i < 0 ? names.length : i
  }
  return voices
    .filter((v) => v.lang.toLowerCase().replace('_', '-') === want && !NOVELTY.test(v.name))
    .sort((a, b) => voiceTier(b) - voiceTier(a) || rank(a) - rank(b) || Number(b.localService) - Number(a.localService))[0]
}

// 家长在设置里手动选的声线（存在本机）
const chosenKey = (lang: string) => `english-voice:${lang}`
export function chosenVoiceURI(lang: string): string | null {
  try {
    return localStorage.getItem(chosenKey(lang))
  } catch {
    return null
  }
}
export function chooseVoice(lang: string, voiceURI: string | null) {
  try {
    if (voiceURI) localStorage.setItem(chosenKey(lang), voiceURI)
    else localStorage.removeItem(chosenKey(lang))
  } catch {
    /* 存不了就用自动挑的 */
  }
}

/** 系统声线是异步加载的：第一次可能是空的，等 voiceschanged 再取。家长手动选过的优先 */
export function englishVoice(lang: string): SpeechSynthesisVoice | undefined {
  const synth = window.speechSynthesis
  if (!synth) return undefined
  const voices = synth.getVoices()
  const chosen = chosenVoiceURI(lang)
  return voices.find((v) => chosen && v.voiceURI === chosen) ?? (pickVoice(voices, lang) as SpeechSynthesisVoice | undefined)
}
try {
  window.speechSynthesis?.getVoices()
  window.speechSynthesis?.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices())
} catch {
  /* 不支持语音 */
}

/**
 * 读英文（伊顿英语课、拼词）。先放提前录好的 Ava 录音（public/audio/en，见 scripts/en-audio.ts）；
 * 有一句没录到（比如家长自己加的词）就整段交给 iPad 的声音。
 */
export function speakEnglish(text: string, lang = 'en-GB') {
  stopClips()
  const keys = clipKeys(text)
  if (keys) {
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* 不支持语音 */
    }
    playClips(keys, () => speakWithVoice(text, lang))
    return
  }
  speakWithVoice(text, lang)
}

/** 用 iPad 的系统声音读：优先用下载的优质/增强声线，家长手动选过的最优先 */
export function speakWithVoice(text: string, lang = 'en-GB') {
  stopClips()
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text.replace(/_+/g, ' '))
    u.lang = lang
    const voice = englishVoice(lang)
    if (voice) u.voice = voice
    u.rate = 0.85
    // iPad 上 cancel() 后立刻 speak() 可能没声音，稍等一下
    setTimeout(() => synth.speak(u), 60)
  } catch {
    /* 不支持语音 */
  }
}
