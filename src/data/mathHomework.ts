/**
 * 数学老师留的当天作业：按日期放，只在那一天显示。
 * 有作业的日子，在“数学”任务上点“我完成了”会先弹出这张作业卡，做完再交给爸爸妈妈。
 */
export interface MathPrompt {
  /** 这一类问题叫什么 */
  kind: string
  /** 用孩子的话说它是什么 */
  means: string
  /** 可以照着说的问题，数字留空让她看课本的图自己填 */
  ask: string
  /** 算式的样子 */
  shape: string
}

export interface MathHomework {
  date: string
  title: string
  /** 老师的原话 */
  teacher: string
  /** 课本上去哪儿找 */
  where: string
  prompts: MathPrompt[]
  /** 每张小卡上的按钮：没做时 / 做完时（默认“我提了一个 / ✓ 我提过了”） */
  button?: { todo: string; done: string; left: string }
}

export const MATH_HOMEWORK: MathHomework[] = [
  {
    date: '2026-11-16',
    title: '学着提数学问题',
    teacher: '学习提连加、连减、加减混合的数学问题，可以以 58 页的合唱团为例。',
    where: '翻开数学书第 58 页，看合唱团那幅图，数一数图上的人，把数字填进下面的话里，大声说给爸爸妈妈听。',
    prompts: [
      { kind: '连加', means: '一次又一次地加上去', ask: '合唱团第一排有（ ）人，第二排有（ ）人，第三排有（ ）人，一共有多少人？', shape: '□ + □ + □ = □' },
      { kind: '连减', means: '一次又一次地减掉', ask: '合唱团一共有（ ）人，先走了（ ）人，又走了（ ）人，还剩多少人？', shape: '□ − □ − □ = □' },
      { kind: '加减混合', means: '有加也有减', ask: '合唱团原来有（ ）人，走了（ ）人，又来了（ ）人，现在有多少人？', shape: '□ − □ + □ = □' },
    ],
  },
  {
    date: '2026-11-17',
    title: '让两个人一样多',
    teacher: '说一说课本第 60 页：妹妹想和哥哥的红薯一样多，你有什么办法？',
    where: '翻开数学书第 60 页：哥哥挖了 5 个红薯，妹妹挖了 3 个。下面三个办法，每个都用自己的话说给爸爸妈妈听。',
    prompts: [
      { kind: '添加', means: '给少的那边添上', ask: '妹妹再挖 2 个红薯，妹妹也有 5 个了。', shape: '3 + 2 = 5' },
      { kind: '移除', means: '把多的那边拿走', ask: '哥哥去掉 2 个红薯，哥哥也只有 3 个了。', shape: '5 − 2 = 3' },
      { kind: '重新分配', means: '多的分给少的', ask: '哥哥给妹妹 1 个红薯，两个人都是 4 个。', shape: '5 − 1 = 3 + 1' },
    ],
    button: { todo: '我说了这个办法', done: '✓ 我说过了', left: '个办法' },
  },
  {
    date: '2026-11-23',
    title: '可爱的企鹅',
    teacher: '复习观察 62 页的图片：说一说发现了哪些数学信息，提一提数学问题，画一画怎么解决这个问题，列一列算式。',
    where: '翻开数学书第 62 页，看可爱的企鹅那幅图。下面四步一步一步做，每一步都说给爸爸妈妈听。',
    prompts: [
      { kind: '说一说', means: '图上能数出来的数', ask: '我发现：有（ ）只企鹅在……，有（ ）只企鹅在……', shape: '先数清楚，再说完整' },
      { kind: '提一提', means: '用这些数问一个问题', ask: '……一共有多少只企鹅？或者：……还剩多少只企鹅？', shape: '问题最后是“？”' },
      { kind: '画一画', means: '用圆圈代替企鹅', ask: '在纸上画○，一个○就是一只企鹅，圈一圈、划一划，看看答案是几。', shape: '○○○ ○○' },
      { kind: '列一列', means: '把画的变成算式', ask: '照着画的写出算式，说出得数，再用一句话回答问题。', shape: '□ ○ □ = □' },
    ],
    button: { todo: '这一步做好了', done: '✓ 做好了', left: '步' },
  },
  {
    date: '2026-11-24',
    title: '做个加法表',
    teacher: '说一说你在加法表中发现了什么：横着看……竖着看……斜着看……',
    where: '翻开数学书上的加法表（今天课上讲的《做个加法表》）。用手指沿着一行、一列、一条斜线慢慢看，每看一种就说给爸爸妈妈听。',
    prompts: [
      { kind: '横着看', means: '沿着一行从左往右', ask: '这一行的算式，哪个数一样？哪个数一个比一个多 1？得数有什么变化？', shape: '我发现：横着看，……' },
      { kind: '竖着看', means: '沿着一列从上往下', ask: '这一列的算式，哪个数一样？哪个数在变？得数有什么变化？', shape: '我发现：竖着看，……' },
      { kind: '斜着看', means: '沿着斜线看', ask: '找一找得数一样的算式在哪儿？比一比，前面的数和后面的数是怎么变的？', shape: '我发现：斜着看，……' },
    ],
    button: { todo: '我说了这一个', done: '✓ 说过了', left: '个发现' },
  },
]

export function mathHomeworkFor(today: string): MathHomework | undefined {
  return MATH_HOMEWORK.find((h) => h.date === today)
}
