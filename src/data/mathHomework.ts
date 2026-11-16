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
]

export function mathHomeworkFor(today: string): MathHomework | undefined {
  return MATH_HOMEWORK.find((h) => h.date === today)
}
