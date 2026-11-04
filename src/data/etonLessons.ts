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

/** 课本里的动作词：边做动作边说整句，再和四季连起来 */
export interface VerbsCard {
  kind: 'verbs'
  title: string
  tag: string
  verbs: { word: string; icon: string; meaning: string; sentence: string }[]
  talk: { q: string; a: string }[]
  remember?: { say: string; not: string }
}

/** 小书跟读：每两页一问一答 */
export interface BookCard {
  kind: 'book'
  title: string
  tag: string
  pages: { pages: string; icon: string; lead: string; q: string; a: string }[]
  words: string[]
}

export type LessonCard = WordCard | TopicCard | VerbsCard | BookCard

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
  {
    date: '2026-11-04',
    title: '11 月 4 日 · 周三',
    cards: [
      {
        kind: 'word',
        word: 'me',
        tag: 'Sight Words 11',
        meaning: '我',
        spell: ['M', 'E'],
        tip: 'Only two letters! M-E is me. M-Y is my.',
        sentences: ['Look at me.', "It's me!", 'Can you see me?'],
        remember: { say: "It's me.", not: 'It me.' },
      },
      {
        kind: 'verbs',
        title: 'Power Verbs',
        tag: 'Reading Key K1 · Unit 1',
        verbs: [
          { word: 'rain', icon: '🌧️', meaning: '下雨', sentence: 'It is raining.' },
          { word: 'snow', icon: '❄️', meaning: '下雪', sentence: 'It is snowing.' },
          { word: 'bloom', icon: '🌸', meaning: '开花', sentence: 'Flowers bloom.' },
          { word: 'change', icon: '🍂', meaning: '改变', sentence: 'Leaves change colors.' },
        ],
        talk: [
          { q: 'When do flowers bloom?', a: 'Flowers bloom in spring.' },
          { q: 'When do leaves change colors?', a: 'Leaves change colors in fall.' },
          { q: 'When is it snowing?', a: 'It is snowing in winter.' },
        ],
        remember: { say: 'It is raining.', not: 'It raining.' },
      },
      {
        kind: 'book',
        title: 'What Season Is It?',
        tag: 'Little book · Level C',
        pages: [
          { pages: '3–4', icon: '🍂', lead: 'The leaves change color.', q: 'When do leaves change color?', a: 'Leaves change color in fall.' },
          { pages: '5–6', icon: '❄️', lead: 'The snow falls.', q: 'When does snow fall?', a: 'Snow falls in winter.' },
          { pages: '7–8', icon: '🌷', lead: 'The flowers grow.', q: 'When do flowers grow?', a: 'Flowers grow in spring.' },
          { pages: '9–10', icon: '☀️', lead: 'The days become hot.', q: 'When do days become hot?', a: 'Days become hot in summer.' },
        ],
        words: ['change', 'fall', 'grow', 'spring', 'summer', 'winter'],
      },
    ],
  },
]

/** 今天的课；今天没有课时返回 undefined（任务牌上就不显示“看今天的课”） */
export function lessonFor(today: string): EtonLesson | undefined {
  return ETON_LESSONS.find((l) => l.date === today)
}
