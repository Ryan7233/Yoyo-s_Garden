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
  /** 背诵：“周四”→“明天周四老师查”；读熟：“公开课”→“明天有公开课”。老师没说哪天查就不写 */
  dueLabel?: string
  /** 一段一组，一句一行 */
  paragraphs: string[][]
  /** 课文下面再读的词语，一组一行 */
  words?: { title: string; tip?: string; items: string[] }[]
}

/** 《江南》人教版一年级上册，汉乐府。“／”是朗读的停顿：五个字一句，前两个字停一下（二三节奏） */
const JIANGNAN = [
  ['江南／可采莲，', '莲叶／何田田。', '鱼戏／莲叶间。'],
  ['鱼戏／莲叶东，', '鱼戏／莲叶西，', '鱼戏／莲叶南，', '鱼戏／莲叶北。'],
]

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
  {
    title: '江南',
    kind: 'read',
    goal: 3,
    from: '2026-11-23',
    due: '2026-11-23',
    dueLabel: '语文课',
    paragraphs: JIANGNAN,
  },
  {
    // 第二课时后（11/24）：背诵。老师没说哪天查，先挂一周
    title: '江南',
    from: '2026-11-24',
    due: '2026-11-30',
    paragraphs: JIANGNAN,
  },
  {
    // 11/27：读至少三遍、会读课后词语。下周有《雨点儿》录像课（哪天没说），先挂到下周五
    // 2024 新版第 10 课：“从云彩里落下来”（旧版是“飘落”），最后一句“开出了红的花，长出了绿的草”
    title: '雨点儿',
    kind: 'read',
    goal: 3,
    from: '2026-11-27',
    due: '2026-12-04',
    paragraphs: [
      ['数不清的雨点儿，', '从云彩里落下来。'],
      ['半空中，', '大雨点儿问小雨点儿：', '“你要到哪里去？”'],
      ['小雨点儿回答：', '“我要去有花有草的地方。', '你呢？”'],
      ['大雨点儿说：', '“我要去没有花没有草的地方。”'],
      ['不久，', '有花有草的地方，', '花更红了，', '草更绿了。', '没有花没有草的地方，', '开出了红的花，', '长出了绿的草。'],
    ],
    words: [
      { title: '课文里的词语', items: ['雨点儿', '数不清', '云彩', '半空', '回答', '地方', '不久', '更红', '更绿'] },
      { title: '读准多音字', items: ['数（shǔ）不清', '数（shù）学', '长（zhǎng）出', '长（cháng）短'] },
      { title: '注意“不”的读音', tip: '后面的字是第四声，“不”读 bú', items: ['不（bù）多', '不（bù）行', '不（bù）久', '不（bú）用', '不（bú）去'] },
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
