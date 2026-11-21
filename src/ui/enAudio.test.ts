import { describe, expect, it } from 'vitest'
import manifest from '../data/enAudio.json'
import { ETON_LESSONS } from '../data/etonLessons'
import { audioChunks, audioKey } from './enAudioKey'
import { clipKeys } from './enClips'

describe('英文录音', () => {
  it('按句拆开，横线念成 blank', () => {
    expect(audioChunks('cat. The cat is big.')).toEqual(['cat.', 'The cat is big.'])
    expect(audioChunks('I ___ happy.')).toEqual(['I blank happy.'])
    expect(audioChunks('Is it cold? Yes!')).toEqual(['Is it cold?', 'Yes!'])
  })

  it('大小写、引号、句末句号不影响；问号影响', () => {
    expect(audioKey('Cat.')).toBe(audioKey('cat'))
    expect(audioKey('“We are friends.”')).toBe(audioKey('we are friends'))
    expect(audioKey('Is it cold?')).not.toBe(audioKey('Is it cold'))
  })

  it('缺一句就整段不用录音', () => {
    const have = new Set([audioKey('cat')])
    expect(clipKeys('cat.', have)).toEqual([audioKey('cat')])
    expect(clipKeys('cat. The cat is big.', have)).toBeNull()
    expect(clipKeys('', have)).toBeNull()
  })

  it('伊顿课里配对题的整句、复习词句子都录好了', () => {
    const have = new Set(manifest.keys)
    for (const lesson of ETON_LESSONS)
      for (const card of lesson.cards) {
        if (card.kind === 'match') card.items.forEach((it) => it.sentences.forEach((s) => expect(clipKeys(s, have), s).not.toBeNull()))
        if (card.kind === 'review') card.words.forEach((w) => expect(clipKeys(`${w.word}. ${w.sentence}`, have), w.word).not.toBeNull())
      }
    expect(clipKeys('am', have)).not.toBeNull()
  })
})
