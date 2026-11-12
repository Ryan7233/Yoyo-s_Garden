import { speakEnglish } from '../../ui/voice'

/** 伊顿课本是美式英语（fall、color），用美式发音 */
// 填空的横线念成 blank，别让朗读去念下划线
export const speakEn = (text: string) => speakEnglish(text.replace(/_{2,}/g, ' blank '), 'en-US')

/** 一句话按钮：点一下听发音 */
export function Say({ text, className = '' }: { text: string; className?: string }) {
  return (
    <button className={`eton-say ${className}`} onClick={() => speakEn(text)} aria-label={`听：${text}`}>
      <span>{text}</span>
      <span className="eton-speaker" aria-hidden>🔊</span>
    </button>
  )
}
