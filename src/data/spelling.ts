import type { SpellKind } from './types'

// 拼写分级（家长录词时的提示）：大多数新词认识、会说就够了；
// 要求会拼的只有两类：符合拼读规律的短词，和高频词。

/** 一年级常见高频词（不完全符合拼读规律，要整体记） */
export const SIGHT_WORDS = [
  'the', 'a', 'i', 'to', 'and', 'is', 'it', 'in', 'you', 'of', 'he', 'she', 'we', 'me', 'be', 'my',
  'was', 'said', 'they', 'are', 'come', 'some', 'have', 'like', 'look', 'what', 'where', 'there',
  'here', 'one', 'two', 'do', 'go', 'no', 'so', 'all', 'his', 'her', 'for', 'with', 'this', 'that',
  'your', 'put', 'want', 'saw', 'who', 'were', 'when', 'went', 'from', 'too', 'very', 'out',
  'down', 'little', 'away', 'play', 'yes', 'see', 'can', 'not', 'get', 'got', 'had',
  'came', 'make', 'made', 'would', 'could', 'should', 'again', 'any', 'many', 'once', 'does', 'done',
] as const

/** 摸底用的 10 个简单规律词 */
export const BASELINE_WORDS = ['cat', 'big', 'hot', 'sun', 'dog', 'bed', 'map', 'pig', 'cup', 'red'] as const

/** 摸底结论：对 8 个及以上直接开始；5~7 个先只拼规律词；更少先补拼读 */
export function baselineAdvice(correct: number, total: number = BASELINE_WORDS.length): string {
  if (correct >= Math.ceil(total * 0.8)) return '拼读底子在，可以直接按每天 3 个词开始。'
  if (correct >= Math.ceil(total * 0.5)) return '可以开始，但前两周只选符合拼读规律的短词（比如 hot、jump），高频词往后放。'
  return '建议先花两三周补一补拼读规则（字母发音、短元音），再开始每天拼词。'
}

// 拼读规律词：开头辅音（组合）+ 元音（组合）+ 结尾辅音（组合），可带简单词尾。只用来提示，家长可以改。
const ONSET = '(?:spl|spr|str|scr|thr|shr|bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr|tw|sh|ch|th|wh|qu|[bcdfghjklmnprstvwyz])?'
const VOWEL = '(?:igh|ee|oo|ai|ay|oa|ar|or|ir|ur|er|ow|ou|oi|oy|ea|a|e|i|o|u)'
const CODA = '(?:tch|nch|ll|ss|ff|zz|ck|sh|ch|th|ng|nk|mp|nd|nt|st|sk|lt|lk|ft|pt|lp|lf|bb|dd|gg|mm|nn|pp|tt|rr|[bcdfgklmnprstvxz])?'
const ENDING = '(?:e|s|es|y|er|ing|ed)?'
const DECODABLE = new RegExp(`^${ONSET}${VOWEL}${CODA}${ENDING}$`)

export function isDecodable(word: string): boolean {
  return word.length <= 7 && DECODABLE.test(word)
}

const SIGHT = new Set<string>(SIGHT_WORDS)

export function classifySpellWord(raw: string): SpellKind {
  const word = raw.trim().toLowerCase()
  if (SIGHT.has(word)) return 'sight'
  return isDecodable(word) ? 'phonics' : 'other'
}

export const SPELL_KIND_LABEL: Record<SpellKind, string> = {
  phonics: '规律词',
  sight: '高频词',
  other: '认识就行',
}

/** 能放进拼写本的词：纯字母，最多 20 个 */
export function normalizeSpellWord(raw: string): string | null {
  const word = raw.trim().toLowerCase()
  return /^[a-z][a-z'-]{0,19}$/.test(word) ? word : null
}
