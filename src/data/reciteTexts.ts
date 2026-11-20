/**
 * 要背的课文：从布置那天到老师检查那天都显示在“课文背诵”上。
 * 先看着读，再“遮住背”：每句只露出第一个字，想不起来点一下那句看一眼。
 * 只要“读熟”的课文（kind: 'read'）也挂在“课文朗读和背诵”上，读够 goal 遍才能交。
 */
export interface ReciteText {
  title: string
  /** 默认 'recite' 背诵；'read' 只要读熟 */
  kind?: 'recite' | 'read'
  /** 至少读/背几遍才能交，默认 1 */
  goal?: number
  /** 第一天和老师检查那天（含） */
  from: string
  due: string
  /** 背诵：“周四”→“明天周四老师查”；读熟：“公开课”→“明天有公开课” */
  dueLabel: string
  /** 一段一组，一句一行 */
  paragraphs: string[][]
}

export const RECITE_TEXTS: ReciteText[] = [
  {
    title: '秋天',
    from: '2026-11-17',
    due: '2026-11-19',
    dueLabel: '周四',
    paragraphs: [
      ['天气凉了，', '树叶黄了，', '一片片叶子从树上落下来。'],
      ['天那么蓝，', '那么高。', '一群大雁往南飞，', '一会儿排成个“人”字，', '一会儿排成个“一”字。'],
      ['啊！', '秋天来了！'],
    ],
  },
  {
    title: '比尾巴',
    kind: 'read',
    goal: 3,
    from: '2026-11-18',
    due: '2026-11-19',
    dueLabel: '公开课',
    paragraphs: [
      ['谁的尾巴长？', '谁的尾巴短？', '谁的尾巴好像一把伞？'],
      ['猴子的尾巴长。', '兔子的尾巴短。', '松鼠的尾巴好像一把伞。'],
      ['谁的尾巴弯？', '谁的尾巴扁？', '谁的尾巴最好看？'],
      ['公鸡的尾巴弯。', '鸭子的尾巴扁。', '孔雀的尾巴最好看。'],
    ],
  },
]

/** 今天“课文朗读和背诵”上的全部课文：要背的在前，读熟的在后 */
export function recitesFor(today: string): ReciteText[] {
  return [reciteFor(today, 'recite'), ...RECITE_TEXTS.filter((t) => t.kind === 'read' && t.from <= today && today <= t.due)].filter((t): t is ReciteText => !!t)
}

/** 某一类的第一篇 */
export function reciteFor(today: string, kind: 'recite' | 'read' = 'recite'): ReciteText | undefined {
  return RECITE_TEXTS.find((t) => (t.kind ?? 'recite') === kind && t.from <= today && today <= t.due)
}
