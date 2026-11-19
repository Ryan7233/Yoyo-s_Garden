import { describe, expect, it } from 'vitest'
import { pickVoice, voiceTier, type VoiceLike } from './voice'

const v = (name: string, lang: string, voiceURI = `com.apple.voice.compact.${lang}.${name}`, localService = true): VoiceLike => ({ name, lang, voiceURI, localService })

describe('挑英文声线', () => {
  it('同口音里优质 > 增强 > 普通', () => {
    const voices = [
      v('Samantha', 'en-US'),
      v('Samantha', 'en-US', 'com.apple.voice.enhanced.en-US.Samantha'),
      v('Zoe', 'en-US', 'com.apple.voice.premium.en-US.Zoe'),
    ]
    expect(pickVoice(voices, 'en-US')?.voiceURI).toContain('premium')
    expect(voiceTier(voices[1])).toBe(1)
  })
  it('档位相同时按常用名字排，Ava 在 Samantha 前', () => {
    expect(pickVoice([v('Samantha', 'en-US'), v('Ava', 'en-US')], 'en-US')?.name).toBe('Ava')
  })
  it('不要搞怪声线，不串口音；没有时交给系统默认', () => {
    expect(pickVoice([v('Zarvox', 'en-US'), v('Grandma', 'en-US')], 'en-US')).toBeUndefined()
    expect(pickVoice([v('Serena', 'en-GB', 'com.apple.voice.premium.en-GB.Serena')], 'en-US')).toBeUndefined()
    expect(pickVoice([v('Daniel', 'en_GB')], 'en-GB')?.name).toBe('Daniel')
  })
})
