// 计时器的语音提示和提示音：要足够响，家长在隔壁也能听到（SPEC 4.3）
// iPad Safari 要求第一次发声发生在点按里，所以“开始”按钮里先调用 unlockAudio()。

let ctx: AudioContext | null = null

export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!ctx && AC) ctx = new AC()
    void ctx?.resume()
  } catch {
    /* 不支持就只用语音 */
  }
}

/** 响亮的提示音：freq 赫兹，持续 ms 毫秒 */
export function beep(freq = 880, ms = 250) {
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
