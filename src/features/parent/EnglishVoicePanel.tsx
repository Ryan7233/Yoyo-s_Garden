import { useEffect, useState } from 'react'
import { englishVoice, speakEnglish, voiceTier } from '../../ui/voice'

const SLOTS = [
  { lang: 'en-US', label: '伊顿英语（美音）', sample: 'Hello! I am Yoyo. We are friends.' },
  { lang: 'en-GB', label: '单词默写（英音）', sample: 'apple, banana, orange' },
]
const TIER = ['普通', '增强', '优质']

/** 家长看一眼英文朗读用的是哪个声线，点一下试听；没下载增强版时提示去哪里下载 */
export function EnglishVoicePanel() {
  const [, refresh] = useState(0)
  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const on = () => refresh((n) => n + 1)
    synth.addEventListener?.('voiceschanged', on)
    const t = setTimeout(on, 300)
    return () => {
      synth.removeEventListener?.('voiceschanged', on)
      clearTimeout(t)
    }
  }, [])
  if (!window.speechSynthesis) return null
  const picks = SLOTS.map((s) => ({ ...s, voice: englishVoice(s.lang) }))
  const plain = picks.some((p) => !p.voice || voiceTier(p.voice) === 0)

  return (
    <div className="voice-panel">
      {picks.map(({ lang, label, sample, voice }) => (
        <div className="row" key={lang}>
          <span className="row-icon">🔊</span>
          <div className="row-main">
            <div className="row-title">{label}</div>
            <div className="row-sub">{voice ? `${voice.name} · ${TIER[voiceTier(voice)]}` : '系统默认声音'}</div>
          </div>
          <button className="btn btn-ghost" onClick={() => speakEnglish(sample, lang)}>试听</button>
        </div>
      ))}
      {plain && (
        <p className="row-sub voice-tip">
          想让英文更自然：在 iPad 上打开「设置 → 辅助功能 → 朗读内容 → 声音 → 英语」，下载 Ava 或 Samantha 的「增强」版（英音可下 Serena），回来这里会自动换上。
        </p>
      )}
    </div>
  )
}
