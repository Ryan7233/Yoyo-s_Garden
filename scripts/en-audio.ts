// 把伊顿课、美森 PU 课和拼词里会读到的英文，提前用微软 Ava 的声音做成 MP3（iPad 网页拿不到下载的优质声音）。
// 用法：npm run audio:en
//   第一次先装朗读工具：python3 -m venv .venv-tts && .venv-tts/bin/pip install edge-tts
// 只生成新增的句子；课里不再用的录音会删掉。生成完记得提交 public/audio/en 和 src/data/enAudio.json。
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { promisify } from 'node:util'
import { ETON_LESSONS } from '../src/data/etonLessons.ts'
import { PU_LESSONS } from '../src/data/puLessons.ts'
import { WORDS_KIDS } from '../src/data/wordsKids.ts'
import { BASELINE_WORDS, SIGHT_WORDS } from '../src/data/spelling.ts'
import { audioChunks, audioKey } from '../src/ui/enAudioKey.ts'

const VOICE = 'en-US-AvaNeural'
const RATE = '-10%'
const OUT = 'public/audio/en'
const MANIFEST = 'src/data/enAudio.json'
const TTS = '.venv-tts/bin/edge-tts'
const run = promisify(execFile)

// 收集要读的句子：key → 原文
const texts = new Map<string, string>()
const add = (text: string) => {
  for (const c of audioChunks(text)) if (!/[㐀-鿿]/.test(c)) texts.set(audioKey(c), c)
}
const SKIP = new Set(['kind', 'icon', 'image', 'date', 'pages', 'group'])
function walk(v: unknown, key = '') {
  if (typeof v === 'string') {
    if (!SKIP.has(key) && !/[㐀-鿿]/.test(v)) add(v)
  } else if (Array.isArray(v)) v.forEach((x) => walk(x, key))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k)
}
for (const lesson of [...ETON_LESSONS, ...PU_LESSONS]) {
  for (const card of lesson.cards) {
    walk(card)
    // 页面上拼出来再读的几种
    if ('family' in card && card.family) card.family.forEach((f) => add(f.head + f.tail))
    if (card.kind === 'match') card.items.forEach((it) => card.choices.forEach((c) => add(`${it.who} ${c}?`)))
  }
}
for (const [w] of WORDS_KIDS) add(w)
for (const w of [...SIGHT_WORDS, ...BASELINE_WORDS]) add(w === 'i' ? 'I' : w)

mkdirSync(OUT, { recursive: true })
const todo = [...texts].filter(([k]) => !existsSync(`${OUT}/${k}.mp3`))
console.log(`共 ${texts.size} 句，新生成 ${todo.length} 句（${VOICE} ${RATE}）`)

let done = 0
const failed: string[] = []
async function worker() {
  for (let item = todo.shift(); item; item = todo.shift()) {
    const [k, text] = item
    for (let attempt = 1; ; attempt++) {
      try {
        await run(TTS, ['--voice', VOICE, `--rate=${RATE}`, '--text', text, '--write-media', `${OUT}/${k}.mp3`])
        if (statSync(`${OUT}/${k}.mp3`).size < 500) throw new Error('太小')
        break
      } catch (e) {
        if (existsSync(`${OUT}/${k}.mp3`)) unlinkSync(`${OUT}/${k}.mp3`)
        if (attempt >= 3) {
          failed.push(`${text}：${(e as Error).message}`)
          break
        }
      }
    }
    if (++done % 50 === 0) console.log(`  ${done}…`)
  }
}
await Promise.all(Array.from({ length: 6 }, worker))

// 删掉不再用的录音；清单只记真的有文件的
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !texts.has(f.slice(0, -4))) unlinkSync(`${OUT}/${f}`)
const keys = [...texts.keys()].filter((k) => existsSync(`${OUT}/${k}.mp3`)).sort()
writeFileSync(MANIFEST, JSON.stringify({ voice: VOICE, keys }) + '\n')
const bytes = keys.reduce((n, k) => n + statSync(`${OUT}/${k}.mp3`).size, 0)
console.log(`完成：${keys.length} 个录音，共 ${(bytes / 1024 / 1024).toFixed(1)} MB`)
if (failed.length) {
  console.log(`没生成的 ${failed.length} 句（播放时会用 iPad 声音）：`)
  failed.forEach((f) => console.log('  ' + f))
  process.exitCode = 1
}
