// 英文录音的文件名规则：生成脚本（scripts/en-audio.ts）和播放时用同一套，所以这里不引别的文件。
// 一段话按句子拆开，每句一个录音；“cat. The cat is big.” = “cat” + “The cat is big.” 两个文件。

/** 按句号、问号、感叹号拆句；填空横线先念成 blank */
export function audioChunks(text: string): string[] {
  return text
    .replace(/_{2,}/g, ' blank ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[a-z]/i.test(s))
}

/** 同一句话不管大小写、首尾引号、句末句号逗号，都对应同一个录音；问号感叹号保留（语调不一样） */
export function normChunk(chunk: string): string {
  return chunk
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/[.,;:]+$/, '')
    .trim()
    .toLowerCase()
}

/** FNV-1a 32 位，8 位十六进制做文件名 */
export function audioKey(chunk: string): string {
  const s = normChunk(chunk)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
