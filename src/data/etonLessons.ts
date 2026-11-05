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

/** 比较级：比两个用 -er + than，三个以上里“最……”用 the + -est */
export interface CompareCard {
  kind: 'compare'
  title: string
  tag: string
  rows: { icon: string; forms: [string, string, string]; two: string; most: string }[]
  talk?: { q: string; a: string }[]
  remember?: { say: string; not: string }
}

/** 问答练习：this / that 游戏、口头彩排 */
export interface TalkCard {
  kind: 'talk'
  title: string
  tag: string
  tip?: string
  talk: { q: string; a: string }[]
}

/** 复习这周的词：点词听发音，每个词一句 */
export interface ReviewCard {
  kind: 'review'
  title: string
  tag: string
  words: { word: string; sentence: string }[]
}

export type LessonCard = WordCard | TopicCard | VerbsCard | BookCard | CompareCard | TalkCard | ReviewCard

export interface EtonLesson {
  date: string
  title: string
  cards: LessonCard[]
}

/** 小书 What Season Is It?（Level C）：周三跟读，周五自己读，周日读给家人听 */
const SEASON_BOOK: Omit<BookCard, 'tag'> = {
  kind: 'book',
  title: 'What Season Is It?',
  pages: [
    { pages: '3–4', icon: '🍂', lead: 'The leaves change color.', q: 'When do leaves change color?', a: 'Leaves change color in fall.' },
    { pages: '5–6', icon: '❄️', lead: 'The snow falls.', q: 'When does snow fall?', a: 'Snow falls in winter.' },
    { pages: '7–8', icon: '🌷', lead: 'The flowers grow.', q: 'When do flowers grow?', a: 'Flowers grow in spring.' },
    { pages: '9–10', icon: '☀️', lead: 'The days become hot.', q: 'When do days become hot?', a: 'Days become hot in summer.' },
  ],
  words: ['change', 'fall', 'grow', 'spring', 'summer', 'winter'],
}

/** 比较级三组（教案“比较级造句”），周四、周五、周六用 */
const HOT = { icon: '☀️', forms: ['hot', 'hotter', 'the hottest'], two: 'Summer is hotter than spring.', most: 'Summer is the hottest season.' } as CompareCard['rows'][number]
const COLD = { icon: '❄️', forms: ['cold', 'colder', 'the coldest'], two: 'Winter is colder than fall.', most: 'Winter is the coldest season.' } as CompareCard['rows'][number]
const SMALL = { icon: '🥤', forms: ['small', 'smaller', 'the smallest'], two: 'My brother is smaller than me.', most: 'The blue cup is the smallest.' } as CompareCard['rows'][number]

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
      { ...SEASON_BOOK, tag: 'Little book · Read along' },
    ],
  },
  {
    date: '2026-11-05',
    title: '11 月 5 日 · 周四',
    cards: [
      {
        kind: 'word',
        word: 'who',
        tag: 'Sight Words 12',
        meaning: '谁',
        spell: ['W', 'H', 'O'],
        tip: 'W-H-O. It sounds like "hoo".',
        sentences: ['Who is it?', 'Who are you?', 'Who is that?'],
        remember: { say: 'Who is it?', not: 'Who it is?' },
      },
      {
        kind: 'compare',
        title: 'Hot and Cold',
        tag: 'Reading Key K1 · Compare',
        rows: [HOT, COLD],
        talk: [
          { q: 'Is summer hotter than spring?', a: 'Yes! Summer is hotter than spring.' },
          { q: 'Which season is the hottest?', a: 'Summer is the hottest season.' },
          { q: 'Is fall colder than winter?', a: 'No! Winter is colder than fall.' },
          { q: 'Which season is the coldest?', a: 'Winter is the coldest season.' },
        ],
        remember: { say: 'hotter', not: 'hoter' },
      },
    ],
  },
  {
    date: '2026-11-06',
    title: '11 月 6 日 · 周五',
    cards: [
      {
        kind: 'word',
        word: 'this',
        tag: 'Sight Words 13',
        meaning: '这个',
        spell: ['T', 'H', 'I', 'S'],
        tip: 'this = near me 👇',
        sentences: ['This is my cup.', 'This is a book.', 'Look at this!'],
        remember: { say: 'This is my cup.', not: 'This my cup.' },
      },
      {
        kind: 'compare',
        title: 'Small, Smaller, the Smallest',
        tag: 'Reading Key K1 · Compare',
        rows: [SMALL],
        talk: [
          { q: 'Which cup is the smallest?', a: 'The blue cup is the smallest.' },
          { q: 'Are you smaller than Dad?', a: 'Yes! I am smaller than Dad.' },
          { q: 'Is a cat smaller than a dog?', a: 'Yes! A cat is smaller than a dog.' },
        ],
        remember: { say: 'smaller than', not: 'smaller then' },
      },
      { ...SEASON_BOOK, tag: 'Little book · Read it yourself' },
    ],
  },
  {
    date: '2026-11-07',
    title: '11 月 7 日 · 周六',
    cards: [
      {
        kind: 'word',
        word: 'that',
        tag: 'Sight Words 14',
        meaning: '那个',
        spell: ['T', 'H', 'A', 'T'],
        tip: 'that = over there 👉',
        sentences: ['That is a bird.', 'Look at that!', 'What is that?'],
        remember: { say: 'What is that?', not: 'What that?' },
      },
      {
        kind: 'talk',
        title: 'This or That?',
        tag: 'Sight Words · Game',
        tip: 'Near me: this 👇 Over there: that 👉',
        talk: [
          { q: 'What is this?', a: 'This is my pencil.' },
          { q: 'What is that?', a: 'That is the door.' },
          { q: 'Is this your cup?', a: 'Yes, this is my cup.' },
          { q: 'Is that a bird?', a: 'Yes, that is a bird.' },
        ],
      },
      {
        kind: 'compare',
        title: 'Write 6 Sentences',
        tag: 'Reading Key K1 · Notebook',
        rows: [HOT, COLD, SMALL],
        remember: { say: 'than', not: 'then' },
      },
    ],
  },
  {
    date: '2026-11-08',
    title: '11 月 8 日 · 周日',
    cards: [
      {
        kind: 'review',
        title: "This Week's Words",
        tag: 'Sight Words · Spelling test',
        words: [
          { word: 'look', sentence: 'Look at me.' },
          { word: 'at', sentence: 'I am at home.' },
          { word: 'me', sentence: "It's me!" },
          { word: 'who', sentence: 'Who is it?' },
          { word: 'this', sentence: 'This is my cup.' },
          { word: 'that', sentence: 'What is that?' },
        ],
      },
      {
        kind: 'talk',
        title: 'Seasons and Compare',
        tag: 'Reading Key K1 · Rehearsal',
        talk: [
          { q: 'How many seasons are there?', a: 'There are four seasons.' },
          { q: 'When do flowers bloom?', a: 'Flowers bloom in spring.' },
          { q: 'Which season is the hottest?', a: 'Summer is the hottest season.' },
          { q: 'When do leaves change colors?', a: 'Leaves change colors in fall.' },
          { q: 'Is winter colder than fall?', a: 'Yes! Winter is colder than fall.' },
          { q: 'Which cup is the smallest?', a: 'The blue cup is the smallest.' },
        ],
      },
      { ...SEASON_BOOK, tag: 'Little book · Read to your family' },
    ],
  },
  {
    date: '2026-11-09',
    title: '11 月 9 日 · 周一',
    cards: [
      {
        kind: 'talk',
        title: 'Before Class',
        tag: 'Reading Key K1 · 3 minutes',
        tip: 'Say one sentence for each!',
        talk: [
          { q: 'hot', a: 'Summer is hotter than spring.' },
          { q: 'cold', a: 'Winter is the coldest season.' },
          { q: 'small', a: 'My brother is smaller than me.' },
        ],
      },
    ],
  },
]

/** 今天的课；今天没有课时返回 undefined（任务牌上就不显示“看今天的课”） */
export function lessonFor(today: string): EtonLesson | undefined {
  return ETON_LESSONS.find((l) => l.date === today)
}
