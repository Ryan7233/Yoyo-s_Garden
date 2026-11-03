/**
 * 伊顿英语课的课后内容：孩子看的单词卡和课本要点（家长的台词不放进来）。
 * 按日期放，只在那一天显示（周二的课周三就不显示了）。
 */
export interface WordCard {
  kind: 'word'
  word: string
  tag: string
  meaning: string
  spell: string[]
  tip: string
  family?: { head: string; tail: string }[]
  places?: string[]
  sentences: string[]
  remember?: { say: string; not: string }
}

export interface TopicCard {
  kind: 'topic'
  title: string
  tag: string
  weather: { word: string; icon: string; sentence: string }[]
  seasons: { word: string; sentence: string }[]
  talk: { q: string; a: string }[]
}

export type LessonCard = WordCard | TopicCard

export interface EtonLesson {
  date: string
  title: string
  cards: LessonCard[]
}

export const ETON_LESSONS: EtonLesson[] = [
  {
    date: '2026-11-03',
    title: '11 月 3 日 · 周二',
    cards: [
      {
        kind: 'word',
        word: 'look',
        tag: 'Sight Words 09',
        meaning: '看',
        spell: ['L', 'O', 'O', 'K'],
        tip: "Two O's, like two eyes!",
        family: [
          { head: 'l', tail: 'ook' },
          { head: 'b', tail: 'ook' },
          { head: 'c', tail: 'ook' },
          { head: 'h', tail: 'ook' },
        ],
        sentences: ['Look at me.', 'Look! A red apple!', 'I look at the sky.'],
        remember: { say: 'Look at the sky.', not: 'look the sky' },
      },
      {
        kind: 'word',
        word: 'at',
        tag: 'Sight Words 10',
        meaning: '在',
        spell: ['A', 'T'],
        tip: 'A-N is an. A-T is at.',
        places: ['at home', 'at school', 'at the park'],
        sentences: ['I am at home.', 'We play at the park.', 'Look at me!'],
      },
      {
        kind: 'topic',
        title: 'Seasons and Weather',
        tag: 'Reading Key K1 · Unit 1',
        weather: [
          { word: 'sunny', icon: '☀️', sentence: 'It is sunny.' },
          { word: 'cloudy', icon: '☁️', sentence: 'It is cloudy.' },
          { word: 'rainy', icon: '🌧️', sentence: 'It is rainy.' },
          { word: 'snowy', icon: '❄️', sentence: 'It is snowy.' },
        ],
        seasons: [
          { word: 'spring', sentence: 'Flowers grow in spring.' },
          { word: 'summer', sentence: 'Days become hot in summer.' },
          { word: 'fall', sentence: 'Leaves change color in fall.' },
          { word: 'winter', sentence: 'Snow falls in winter.' },
        ],
        talk: [
          { q: 'How many seasons are there?', a: 'There are four seasons.' },
          { q: 'What kind of weather do you like?', a: 'I like sunny weather.' },
          { q: 'What is your favorite season?', a: 'My favorite season is ______.' },
        ],
      },
    ],
  },
]

/** 今天的课；今天没有课时返回 undefined（任务牌上就不显示“看今天的课”） */
export function lessonFor(today: string): EtonLesson | undefined {
  return ETON_LESSONS.find((l) => l.date === today)
}
