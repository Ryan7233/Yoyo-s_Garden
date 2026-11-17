/**
 * 要背的课文：从布置那天到老师检查那天都显示在“课文背诵”上。
 * 先看着读，再“遮住背”：每句只露出第一个字，想不起来点一下那句看一眼。
 */
export interface ReciteText {
  title: string
  /** 第一天和老师检查那天（含） */
  from: string
  due: string
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
      ['天空那么蓝，', '那么高。', '一群大雁往南飞，', '一会儿排成个“人”字，', '一会儿排成个“一”字。'],
      ['啊！', '秋天来了！'],
    ],
  },
]

export function reciteFor(today: string): ReciteText | undefined {
  return RECITE_TEXTS.find((t) => t.from <= today && today <= t.due)
}
