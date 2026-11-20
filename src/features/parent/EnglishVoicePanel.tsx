import { useEffect, useState } from 'react'
import { chooseVoice, chosenVoiceURI, englishVoice, isNoveltyVoice, speakEnglish, voiceTier } from '../../ui/voice'

const SLOTS = [
  { lang: 'en-US', label: '伊顿英语（美音）', sample: 'Hello! I am Yoyo. We are friends.' },
  { lang: 'en-GB', label: '单词默写（英音）', sample: 'apple, banana, orange' },
]
const TIER = ['普通', '增强', '优质']
const norm = (lang: string) => lang.replace('_', '-')

/**
 * 家长看一眼英文朗读用的是哪个声线，点一下试听。
 * 展开能看到 iPad 交给网页的全部英文声线，可以手动指定一个（存在本机）。
 */
export function EnglishVoicePanel() {
  const [, refresh] = useState(0)
  const [open, setOpen] = useState(false)
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
  const picks = SLOTS.map((s) => ({ ...s, voice: englishVoice(s.lang), manual: !!chosenVoiceURI(s.lang) }))
  const plain = picks.some((p) => !p.voice || voiceTier(p.voice) === 0)
  const all = window.speechSynthesis
    .getVoices()
    .filter((v) => SLOTS.some((s) => norm(v.lang) === s.lang) && !isNoveltyVoice(v))
    .sort((a, b) => norm(a.lang).localeCompare(norm(b.lang)) * -1 || voiceTier(b) - voiceTier(a) || a.name.localeCompare(b.name))

  return (
    <div className="voice-panel">
      {picks.map(({ lang, label, sample, voice, manual }) => (
        <div className="row" key={lang}>
          <span className="row-icon">🔊</span>
          <div className="row-main">
            <div className="row-title">{label}</div>
            <div className="row-sub">{voice ? `${voice.name} · ${TIER[voiceTier(voice)]}${manual ? ' · 手动选的' : ''}` : '系统默认声音'}</div>
          </div>
          <button className="btn btn-ghost" onClick={() => speakEnglish(sample, lang)}>试听</button>
        </div>
      ))}
      {plain && (
        <p className="row-sub voice-tip">
          想让英文更自然：在 iPad 上打开「设置 → 辅助功能 → 朗读内容 → 声音 → 英语」，下载 Ava 或 Samantha 的「增强」版（英音可下 Serena）。下载后把小花园从后台划掉再打开，回来这里会自动换上。
        </p>
      )}
      <button className="btn btn-ghost btn-small voice-more" onClick={() => setOpen(!open)}>
        {open ? '收起' : `查看 iPad 给网页的全部英文声音（${all.length}）`}
      </button>
      {open && (
        <ul className="voice-list">
          {all.map((v) => {
            const lang = norm(v.lang)
            const using = picks.find((p) => p.lang === lang)?.voice?.voiceURI === v.voiceURI
            return (
              <li key={v.voiceURI + v.lang} className={using ? 'using' : ''}>
                <span className="voice-name">
                  {v.name} <small>{lang === 'en-US' ? '美音' : '英音'} · {TIER[voiceTier(v)]}</small>
                  <small className="voice-uri">{v.voiceURI}</small>
                </span>
                <button className="btn btn-ghost btn-small" onClick={() => {
                  const u = new SpeechSynthesisUtterance(SLOTS.find((s) => s.lang === lang)!.sample)
                  u.voice = v
                  u.lang = v.lang
                  window.speechSynthesis.cancel()
                  setTimeout(() => window.speechSynthesis.speak(u), 60)
                }}>试听</button>
                {using ? (
                  <span className="voice-using">正在用</span>
                ) : (
                  <button className="btn btn-soft btn-small" onClick={() => { chooseVoice(lang, v.voiceURI); refresh((n) => n + 1) }}>用这个</button>
                )}
              </li>
            )
          })}
          {picks.some((p) => p.manual) && (
            <li>
              <button className="btn btn-ghost btn-small" onClick={() => { SLOTS.forEach((s) => chooseVoice(s.lang, null)); refresh((n) => n + 1) }}>恢复自动挑选</button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
