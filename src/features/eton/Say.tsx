import { useState } from 'react'
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

/**
 * 问答里的答句：先盖住，自己先说一遍，再点开看答案、同时听 Ava 读（先想再对，比直接看着念记得牢）。
 * 点开以后和普通句子一样，点一下再听一遍。
 */
export function Answer({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  if (open) return <Say text={text} className="a" />
  return (
    <button className="eton-say a covered" onClick={() => { setOpen(true); speakEn(text) }} aria-label="先自己说，再点开听答案">
      <span>💬 先自己说，再点开听</span>
      <span className="eton-speaker" aria-hidden>👆</span>
    </button>
  )
}
