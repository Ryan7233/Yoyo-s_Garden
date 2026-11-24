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

/** 一组新词带图：点一下听“词 + 句子”，按陆地 / 水分两组 */
export interface LandWord {
  word: string
  icon: string
  sentence: string
  group: 'land' | 'water'
}

export interface VocabCard {
  kind: 'vocab'
  title: string
  tag: string
  tip?: string
  words: LandWord[]
}

/** 拖拽分类：把卡片拖进 Land / Water 框，放错弹回，全对算完成 */
export interface SortCard {
  kind: 'sort'
  title: string
  tag: string
  words: LandWord[]
}

/** 看完视频的勾选题（可多选），点“对答案”显示对错 */
export interface PickCard {
  kind: 'pick'
  title: string
  tag: string
  tip?: string
  question: string
  options: { word: string; icon: string }[]
  answers: string[]
}

/** 课文跟读：分几段，每段几句；words 是每段下面的 Words to Know */
export interface ReadCard {
  kind: 'read'
  title: string
  tag: string
  tip?: string
  sections: { label?: string; lines: string[]; words?: { word: string; note: string }[] }[]
}

/** 纸面作业的看图提示：App 里不答题，只给图、选项点读、词库 */
export interface PaperCard {
  kind: 'paper'
  title: string
  tag: string
  tip?: string
  bank?: string[]
  /** abc：选项前标 a. b. c.（和课本一样） */
  items: { n: string; icon?: string; text: string; options?: string[]; abc?: boolean; tip?: string }[]
}

/** 老师发的海报：整张图，点开能看清 */
export interface PosterCard {
  kind: 'poster'
  title: string
  tag: string
  tip?: string
  image: string
  /** 海报上的句子，点读用 */
  lines?: string[]
}

/** am / are / is 配对：出一个代词，选对的那个词，读出整句 */
export interface MatchCard {
  kind: 'match'
  title: string
  tag: string
  tip?: string
  choices: string[]
  /** 每个代词两句：第一轮用第一句，第二轮用第二句 */
  items: { who: string; answer: string; sentences: [string, string] }[]
}

export type LessonCard = WordCard | TopicCard | VerbsCard | BookCard | CompareCard | TalkCard | ReviewCard | VocabCard | SortCard | PickCard | ReadCard | PaperCard | PosterCard | MatchCard

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

/** 周六的三张卡：周日补作业时也放进周日的课里 */
const THAT_CARD: WordCard = {
  kind: 'word',
  word: 'that',
  tag: 'Sight Words 14',
  meaning: '那个',
  spell: ['T', 'H', 'A', 'T'],
  tip: 'that = over there 👉',
  sentences: ['That is a bird.', 'Look at that!', 'What is that?'],
  remember: { say: 'What is that?', not: 'What that?' },
}

const THIS_THAT_GAME: TalkCard = {
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
}

const SIX_SENTENCES: CompareCard = {
  kind: 'compare',
  title: 'Write 6 Sentences',
  tag: 'Reading Key K1 · Notebook',
  rows: [HOT, COLD, SMALL],
  remember: { say: 'than', not: 'then' },
}

// ---- Unit 2 Our Land and Water（11/12–11/15）----

/** 课本第 10 页 / 老师词汇海报的 9 个词 */
const LAND_WATER: LandWord[] = [
  { word: 'mountain', icon: '🏔️', sentence: 'The mountain is high.', group: 'land' },
  { word: 'hill', icon: '⛰️', sentence: 'The hill is low.', group: 'land' },
  { word: 'valley', icon: '🏞️', sentence: 'The valley is between two mountains.', group: 'land' },
  { word: 'plain', icon: '🌾', sentence: 'The plain is flat.', group: 'land' },
  { word: 'desert', icon: '🏜️', sentence: 'The desert is dry.', group: 'land' },
  { word: 'island', icon: '🏝️', sentence: 'Water is all around the island.', group: 'land' },
  { word: 'ocean', icon: '🌊', sentence: 'The ocean is very big.', group: 'water' },
  { word: 'lake', icon: '🦆', sentence: 'The lake has land all around it.', group: 'water' },
  { word: 'river', icon: '🛶', sentence: 'The river flows to the sea.', group: 'water' },
]

const LAND_WATER_CARD: VocabCard = {
  kind: 'vocab',
  title: 'Our Land and Water',
  tag: 'Reading Key K1 · Unit 2 · p. 10',
  tip: 'Tap a picture. Listen and say it!',
  words: LAND_WATER,
}

const BROOM_VIDEO = 'Room on the Broom · Video'

/** 老师发的简化版故事 5 段 */
const STORY: ReadCard['sections'] = [
  {
    label: '01 Meet the travellers',
    lines: ['A witch has a flying broom.', 'Her cat rides with her.', 'They fly high in the sky.', 'The witch wears a tall hat.', 'She has a bow and a wand.', 'The wind begins to blow.'],
    words: [{ word: 'witch', note: 'a woman who can do magic' }, { word: 'broom', note: 'a brush with a long handle' }, { word: 'wand', note: 'a stick used for magic' }],
  },
  {
    label: '02 Lost and found',
    lines: ['The wind blows the hat away.', 'A dog finds it and gives it back.', 'Then the witch loses her bow.', 'A bird brings the bow to her.', 'Later, her wand falls down.', 'A frog finds the missing wand.'],
    words: [{ word: 'find', note: 'to see something you were looking for' }, { word: 'bring', note: 'to carry something to someone' }, { word: 'missing', note: 'lost; not where it should be' }],
  },
  {
    label: '03 A crowded ride',
    lines: ['The witch lets her new friends ride.', 'Now five travellers share the broom.', 'There is very little space.', 'The frog jumps with excitement.', 'Suddenly, the broom breaks.', 'The animals fall into the mud.'],
    words: [{ word: 'share', note: 'to use something with other people' }, { word: 'space', note: 'an empty place for something' }, { word: 'mud', note: 'wet, soft earth' }],
  },
  {
    label: '04 Friends to the rescue',
    lines: ['A hungry dragon sees the witch.', 'She needs help from her friends.', 'The animals hide together in mud.', 'They look like one big creature.', 'The dragon is scared and leaves.', 'The friends have saved the witch.'],
    words: [{ word: 'dragon', note: 'a make-believe creature' }, { word: 'scared', note: 'afraid of something' }, { word: 'save', note: 'to help someone out of danger' }],
  },
  {
    label: '05 A better broom',
    lines: ['The witch makes a magical mixture.', 'Then she uses a spell.', 'A wonderful new broom appears.', 'It has space for every friend.', 'They can all travel together.', 'Helping and sharing make them happy.'],
    words: [{ word: 'mixture', note: 'things put together' }, { word: 'spell', note: 'words used to make magic happen' }, { word: 'together', note: 'with each other' }],
  },
]

/** 复述提示：每段一两句，用自己的话说 */
const RETELL: ReadCard = {
  kind: 'read',
  title: 'Tell the Story',
  tag: 'Retell · Next class',
  tip: 'Say one or two sentences for each part. Your own words are OK!',
  sections: [
    { label: '01 Meet the travellers', lines: ['A witch and her cat fly on a broom.'] },
    { label: '02 Lost and found', lines: ['The wind blows away her hat, her bow and her wand.', 'A dog, a bird and a frog find them.'] },
    { label: '03 A crowded ride', lines: ['They all ride on the broom.', 'The broom breaks.'] },
    { label: '04 Friends to the rescue', lines: ['A dragon wants to eat the witch.', 'The friends scare the dragon away.'] },
    { label: '05 A better broom', lines: ['The witch makes a new broom.', 'There is room for every friend.'] },
  ],
}

const storyCard = (from: number, to: number): ReadCard => ({
  kind: 'read',
  title: 'Room on the Broom',
  tag: `Story · Part ${from}–${to}`,
  tip: 'Read slowly. Pause at each full stop.',
  sections: STORY.slice(from - 1, to),
})

/** 课本第 13 页 Check Understanding 1–4：在课本上做，这里只给看图提示 */
const CHECK_P13: PaperCard = {
  kind: 'paper',
  title: 'Check Understanding',
  tag: 'Reading Key K1 · p. 13 · No. 1–4',
  tip: 'Do it in your book ✏️ Tap a word to hear it.',
  items: [
    { n: '1', icon: '🏜️ 🏝️', text: 'Which land does each picture show?', tip: 'Write a word under each picture. Copy it from the word cards ✍️' },
    { n: '2', icon: '⬆️', text: 'What is the highest form of land?', options: ['a hill', 'a valley', 'a mountain'], abc: true },
    { n: '3', icon: '➖', text: 'What is flat land called?', options: ['a valley', 'a plain', 'a hill'], abc: true },
    { n: '4', icon: '🌊', text: 'A ____ flows into an ocean.', options: ['lake', 'river', 'island'], abc: true },
  ],
}

// ---- Unit 3 We Are Friends（11/17–11/22，Sight Word Key 第 16–21 页）----

const U3 = 'Sight Word Key · Unit 3'
const poster = (title: string, image: string, lines?: string[], tip?: string): PosterCard => ({ kind: 'poster', title, tag: 'Poster', image: `eton/${image}.jpg`, lines, tip })

/** 练习册一词一页：①涂色 ②描写 ③圈词 ④拼写格自己做，⑤和家长一起造句 */
const workbook = (pages: [number, string, string][], own: string[], tip = '①涂色 ②描写 ③圈词 ④拼写格，自己做。⑤先读书上的句子，再写一句自己的。'): PaperCard => ({
  kind: 'paper',
  title: `Workbook · Sight Word ${pages[0][0]}–${pages[pages.length - 1][0]}`,
  tag: 'Workbook 1 · Make nice sentences',
  tip,
  items: [
    ...pages.map(([n, text, hint]) => ({ n: String(n), text, tip: hint })),
    { n: '⑤', text: 'My own sentence:', options: own },
  ],
})

const U3_WORDS: { word: string; sentence: string }[] = [
  { word: 'I', sentence: 'I am Tom.' },
  { word: 'am', sentence: 'I am a girl.' },
  { word: 'you', sentence: 'I love you.' },
  { word: 'are', sentence: 'You are tall.' },
  { word: 'we', sentence: 'We win!' },
  { word: 'they', sentence: 'They play ball.' },
  { word: 'he', sentence: 'He is my friend.' },
  { word: 'she', sentence: 'She is my teacher.' },
]

const AM_ARE_IS: MatchCard = {
  kind: 'match',
  title: 'am, are or is?',
  tag: 'Unit 3 · Game',
  tip: 'I am · You / We / They are · He / She is',
  choices: ['am', 'are', 'is'],
  items: [
    { who: 'I', answer: 'am', sentences: ['I am happy.', 'I am at home.'] },
    { who: 'You', answer: 'are', sentences: ['You are my friend.', 'You are tall.'] },
    { who: 'We', answer: 'are', sentences: ['We are friends.', 'We are a family.'] },
    { who: 'They', answer: 'are', sentences: ['They are friends.', 'They are at school.'] },
    { who: 'He', answer: 'is', sentences: ['He is my friend.', 'He is my brother.'] },
    { who: 'She', answer: 'is', sentences: ['She is my teacher.', 'She is my mom.'] },
  ],
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
    cards: [THAT_CARD, THIS_THAT_GAME, SIX_SENTENCES],
  },
  {
    date: '2026-11-08',
    title: '11 月 8 日 · 周日（补周六）',
    // 周六没做：先补明天课上要查的 6 个比较句，再做周日的；that 和听写下周也来得及
    cards: [
      SIX_SENTENCES,
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
      THAT_CARD,
      THIS_THAT_GAME,
      // 加练：Sight Words 第 2 单元最后两个词，先学 This is a cat.，再反过来说 This is not a cat.
      {
        kind: 'word',
        word: 'is',
        tag: 'Sight Words 15',
        meaning: '是',
        spell: ['I', 'S'],
        tip: 'Only two letters! I comes first: I-S.',
        sentences: ['This is a book.', 'The sky is blue.', 'This is my cat.'],
        remember: { say: 'This is my cat.', not: 'This my cat.' },
      },
      {
        kind: 'word',
        word: 'not',
        tag: 'Sight Words 16',
        meaning: '不是',
        spell: ['N', 'O', 'T'],
        tip: 'N-O-T is not. N-O is no.',
        sentences: ['This is not a ball.', 'The sky is not green.', 'She is not happy.'],
        remember: { say: 'This is not a ball.', not: 'This not a ball.' },
      },
      {
        kind: 'talk',
        title: 'Yes or No?',
        tag: 'Sight Words · Game',
        tip: 'Mom or Dad says it wrong. You fix it with not!',
        talk: [
          { q: 'This is a ball!', a: 'No! This is not a ball. This is an apple.' },
          { q: 'It is red!', a: 'No! It is not red. It is blue.' },
          { q: 'Is it summer now?', a: 'No. It is not summer. It is fall.' },
        ],
      },
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
  {
    date: '2026-11-12',
    title: '11 月 12 日 · 周四',
    cards: [
      LAND_WATER_CARD,
      {
        kind: 'talk',
        title: 'Higher or Lower?',
        tag: 'Reading Key K1 · Compare',
        tip: 'Land or water? Then compare!',
        talk: [
          { q: 'Is a mountain land or water?', a: 'Land!' },
          { q: 'Is a lake land or water?', a: 'Water!' },
          { q: 'Which is higher, a mountain or a hill?', a: 'A mountain is higher than a hill.' },
          { q: 'Which is lower?', a: 'A hill is lower than a mountain.' },
        ],
      },
      {
        kind: 'read',
        title: 'Earth',
        tag: 'Reading Key K1 · p. 11',
        tip: 'Point to the picture. Read the sentence.',
        sections: [{ lines: ['Earth is made up of land and water.', 'An island is surrounded by water.', 'Oceans cover much of our Earth.', 'Rivers flow into oceans.'] }],
      },
      {
        kind: 'read',
        title: 'Our Land and Water',
        tag: 'Reading Key K1 · p. 12–13',
        tip: 'Echo read: Mom or Dad reads, you read after. Can you read land, hill, flat, lake by yourself?',
        sections: [
          {
            label: 'p. 12 · Land',
            lines: ['Earth is made up of land and water.', 'This is a picture of Earth.', 'Can you tell which part is land?', 'Which part is water?', 'Earth has different kinds of land.', 'A mountain is the highest form of land.', 'A hill is lower than a mountain.', 'A valley is the low land between mountains.', 'A valley is usually narrow.', 'Some land is flat.', 'Flat land is called a plain.', 'A plain is good for farming.'],
          },
          {
            label: 'p. 13 · Water',
            lines: ['Earth has different kinds of water.', 'An ocean is the largest body of water.', 'Oceans cover much of our Earth.', 'A lake is a large body of water.', 'It is surrounded by land.', 'A river is a long body of water.', 'It flows into an ocean.'],
          },
        ],
      },
      {
        kind: 'talk',
        title: 'Room on the Broom',
        tag: BROOM_VIDEO,
        tip: 'Watch the video from 0:00 to 7:38. Stop at 1:15 when the dog comes.',
        talk: [{ q: 'What does the dog want?', a: 'It wants to ride on the broom.' }],
      },
    ],
  },
  {
    date: '2026-11-13',
    title: '11 月 13 日 · 周五（自己做）',
    cards: [
      {
        kind: 'pick',
        title: 'Room on the Broom',
        tag: `${BROOM_VIDEO} · Task 1`,
        tip: 'Watch the video again: 0:00 to 7:38. Look for who gets on the broom!',
        question: 'Who rides on the broom? Tap all the right ones.',
        options: [
          { word: 'cat', icon: '🐱' },
          { word: 'dog', icon: '🐶' },
          { word: 'bird', icon: '🐦' },
          { word: 'frog', icon: '🐸' },
          { word: 'dragon', icon: '🐉' },
        ],
        answers: ['cat', 'dog', 'bird', 'frog'],
      },
      { ...LAND_WATER_CARD, tag: 'Task 2 · Word cards' },
      { kind: 'sort', title: 'Land or Water?', tag: 'Task 2 · Game', words: LAND_WATER },
      { ...CHECK_P13, tag: 'Task 3 · p. 13 · No. 1–4' },
    ],
  },
  {
    date: '2026-11-14',
    title: '11 月 14 日 · 周六',
    cards: [
      {
        kind: 'paper',
        title: 'Answer the Questions',
        tag: 'Reading Key K1 · p. 13 · Yellow box',
        tip: 'Say it first, then write. Many things: add s!',
        items: [
          { n: '1', icon: '🏔️', text: 'What are some different kinds of land?', options: ['mountains', 'hills', 'valleys', 'plains', 'deserts', 'islands'] },
          { n: '2', icon: '🌊', text: 'What are some different kinds of water?', options: ['oceans', 'lakes', 'rivers'] },
        ],
      },
      {
        kind: 'paper',
        title: 'A. Look, Read, and Write',
        tag: 'Reading Key K1 · p. 14 · A',
        bank: ['narrow', 'farming', 'dry', 'lower'],
        items: [
          { n: '1', icon: '⛰️', text: 'A hill is ____ than a mountain.' },
          { n: '2', icon: '🏞️', text: 'A valley is usually ____.' },
          { n: '3', icon: '🏜️', text: 'A desert is a ____ land.' },
          { n: '4', icon: '🌾', text: 'A plain is good for ____.' },
        ],
      },
      {
        kind: 'paper',
        title: 'B. Of or On?',
        tag: 'Reading Key K1 · p. 14 · B',
        tip: 'Circle the right word, then write it.',
        items: [
          { n: '1', icon: '🌍', text: 'Earth is made up ____ land and water.', options: ['of', 'on'] },
          { n: '2', icon: '🏞️', text: 'A valley is ____ two mountains.', options: ['under', 'between'] },
          { n: '3', icon: '🏝️', text: 'An island is surrounded ____ water.', options: ['at', 'by'] },
          { n: '4', icon: '🛶', text: 'A river flows ____ an ocean.', options: ['into', 'onto'] },
        ],
      },
      storyCard(1, 2),
      {
        kind: 'review',
        title: 'Make Sentences',
        tag: 'Unit 2 · Say it',
        words: [
          { word: 'mountain', sentence: 'The mountain is high.' },
          { word: 'hill', sentence: 'A hill is lower than a mountain.' },
          { word: 'island', sentence: 'An island is surrounded by water.' },
        ],
      },
    ],
  },
  {
    date: '2026-11-15',
    title: '11 月 15 日 · 周日',
    cards: [
      {
        kind: 'talk',
        title: 'Can I Ride on Your Broom?',
        tag: BROOM_VIDEO,
        tip: 'Pause at 1:15, 2:25 and 3:36. Read the words in the book. Then act it out!',
        talk: [
          { q: 'I found your hat! Can I ride on your broom?', a: 'Yes, you can!' },
          { q: 'I found your bow! Can I ride on your broom?', a: 'Yes, you can!' },
          { q: 'I found your wand! Can I ride on your broom?', a: 'Yes, you can!' },
          // 约 5:15 泥巴怪出现，6:12 揭晓
          { q: 'Who is it?', a: 'It is the cat, the dog, the bird and the frog!' },
        ],
      },
      storyCard(3, 5),
      RETELL,
    ],
  },
  {
    date: '2026-11-17',
    title: '11 月 17 日 · 周二',
    cards: [
      {
        kind: 'word',
        word: 'I',
        tag: 'Sight Words 17',
        meaning: '我',
        spell: ['I'],
        tip: 'I is always a big letter! I 永远大写。',
        sentences: ['I am Tom.', 'I am a girl.', 'I am happy.'],
        remember: { say: 'I am', not: 'i am' },
      },
      {
        kind: 'word',
        word: 'am',
        tag: 'Sight Words 18',
        meaning: '是（只跟 I 一起）',
        spell: ['A', 'M'],
        tip: 'I and am are best friends. I am = I’m',
        sentences: ['I am Yoyo.', 'I am a student.', 'I am at home.'],
        remember: { say: 'I am', not: 'I is' },
      },
      {
        kind: 'talk',
        title: 'All About Me',
        tag: 'Say it · Full sentence',
        tip: 'Answer with I am …',
        talk: [
          { q: 'Who are you?', a: 'I am Yoyo.' },
          { q: 'Are you a boy or a girl?', a: 'I am a girl.' },
          { q: 'How do you feel?', a: 'I am happy.' },
          { q: 'Where are you?', a: 'I am at home.' },
          { q: 'What are you doing?', a: 'I am reading.' },
        ],
      },
      poster('4 Ways to Use I AM', 'u3-i-am', ['I am a student.', 'I am reading a book.', 'I am happy.', 'I am at home.']),
      workbook(
        [
          [17, 'I', '③ 圈出 3 个单独的 I'],
          [18, 'am', '④ 拼写格：a m'],
        ],
        ['I am Tom.', 'I am Yoyo.', 'I am a girl.', 'I am happy.'],
      ),
    ],
  },
  {
    date: '2026-11-18',
    title: '11 月 18 日 · 周三',
    cards: [
      {
        kind: 'word',
        word: 'you',
        tag: 'Sight Words 19',
        meaning: '你',
        spell: ['Y', 'O', 'U'],
        tip: 'you = the person I talk to 👉',
        sentences: ['I love you.', 'You are tall.', 'You are my friend.'],
      },
      {
        kind: 'word',
        word: 'are',
        tag: 'Sight Words 20',
        meaning: '是（跟 you / we / they）',
        spell: ['A', 'R', 'E'],
        tip: 'ar like car and star. The e is quiet. 结尾的 e 不发音',
        family: [
          { head: 'c', tail: 'ar' },
          { head: 'st', tail: 'ar' },
          { head: 'j', tail: 'ar' },
          { head: 'f', tail: 'ar' },
        ],
        sentences: ['You are tall.', 'You are kind.', 'You are funny.'],
        remember: { say: 'You are', not: 'You is' },
      },
      {
        kind: 'talk',
        title: 'Say Something Nice',
        tag: 'Say it · You are …',
        tip: 'Every answer starts with You are!',
        talk: [
          { q: 'You are tall.', a: 'You are tall, too!' },
          { q: 'You are my friend.', a: 'You are my dad.' },
          { q: 'You are kind.', a: 'You are funny.' },
        ],
      },
      {
        kind: 'read',
        title: 'I Am a Mouse',
        tag: `${U3} · p.18`,
        tip: '🐭 You are the mouse. 🐱 Dad is the cat.',
        sections: [{ lines: ['I am a mouse.', 'You are a cat.', 'You are running.', 'I am running, too!', 'Eek!'] }],
      },
      poster('My Pronouns', 'u3-my-pronouns', ['I am happy.', 'You are kind.', 'He is Tom.', 'She is Mia.', 'We are friends.', 'They are in the park.']),
      workbook(
        [
          [19, 'you', '③ 圈出 2 个 you　④ y _ u 填 o，_ o u 填 y'],
          [20, 'are', '④ 拼写格：a r e，别忘了最后的 e'],
        ],
        ['I love you.', 'You are my friend.', 'You are tall.'],
      ),
    ],
  },
  {
    date: '2026-11-19',
    title: '11 月 19 日 · 周四',
    cards: [
      {
        kind: 'word',
        word: 'we',
        tag: 'Sight Words 21',
        meaning: '我们',
        spell: ['W', 'E'],
        tip: 'we = me and you 🤝 The e says its name.',
        family: [
          { head: 'w', tail: 'e' },
          { head: 'm', tail: 'e' },
          { head: 'h', tail: 'e' },
          { head: 'sh', tail: 'e' },
        ],
        sentences: ['We win!', 'We are friends.', 'We are a family.'],
        remember: { say: 'We are', not: 'We is' },
      },
      {
        kind: 'word',
        word: 'they',
        tag: 'Sight Words 22',
        meaning: '他们 / 她们 / 它们',
        spell: ['T', 'H', 'E', 'Y'],
        tip: 'th + ey. More than one: they are.',
        sentences: ['They play ball.', 'They are my friends.', 'They are at school.'],
        remember: { say: 'they', not: 'thay' },
      },
      {
        kind: 'talk',
        title: 'Who Are We? Who Are They?',
        tag: 'Say it · More than one: are',
        talk: [
          { q: 'Who are we?', a: 'We are a family.' },
          { q: 'Where are we?', a: 'We are at home.' },
          { q: 'Who are they?', a: 'They are my friends.' },
          { q: 'What are they?', a: 'They are toys. They are small.' },
        ],
      },
      {
        kind: 'read',
        title: 'They Have Fun',
        tag: `${U3} · p.19`,
        tip: 'Can you spell kicks, fast and fun?',
        sections: [{ lines: ['They play ball.', 'He kicks the ball.', 'She runs fast.', 'They have fun.'] }],
      },
      poster('4 Ways to Use THEY / WE / YOU ARE', 'u3-they-we-you-are', ['They are students.', 'We are playing.', 'You are kind.', 'We are at home.']),
      workbook(
        [
          [21, 'we', '题目以练习册为准'],
          [22, 'they', '题目以练习册为准'],
        ],
        ['We are friends.', 'We are happy.', 'They are my friends.', 'They are at school.'],
        '①–④ 自己做，⑤写一句自己的。',
      ),
    ],
  },
  {
    date: '2026-11-20',
    title: '11 月 20 日 · 周五',
    cards: [
      {
        kind: 'word',
        word: 'he',
        tag: 'Sight Words 23',
        meaning: '他',
        spell: ['H', 'E'],
        tip: 'he = one boy 👦 Only one: is.',
        sentences: ['He is my friend.', 'He is my brother.', 'He is happy.'],
        remember: { say: 'He is', not: 'He are' },
      },
      {
        kind: 'word',
        word: 'she',
        tag: 'Sight Words 24',
        meaning: '她',
        spell: ['S', 'H', 'E'],
        tip: 'sh says "shh" 🤫 she = one girl 👧',
        sentences: ['She is my teacher.', 'She is my mom.', 'She is kind.'],
        remember: { say: 'A girl is she.', not: 'A girl is he.' },
      },
      {
        kind: 'talk',
        title: 'Look at a Photo',
        tag: 'Say it · He is … / She is …',
        tip: 'Point at a family photo. A boy is he. A girl is she.',
        talk: [
          { q: 'Who is he?', a: 'He is my brother.' },
          { q: 'Is he big or small?', a: 'He is small.' },
          { q: 'Who is she?', a: 'She is my mom.' },
          { q: 'Is she kind?', a: 'Yes. She is kind.' },
          { q: 'Who is she?', a: 'She is my teacher.' },
        ],
      },
      poster('4 Ways to Use HE / SHE IS', 'u3-he-she-is', ['He is a student.', 'She is a teacher.', 'He is reading.', 'She is painting.', 'He is happy.', 'She is sleepy.', 'He is at home.', 'She is at school.']),
      workbook(
        [
          [23, 'he', '题目以练习册为准'],
          [24, 'she', '题目以练习册为准'],
        ],
        ['He is my brother.', 'He is my dad.', 'She is my mom.', 'She is my teacher.'],
        '①–④ 自己做，⑤写一句自己的。',
      ),
    ],
  },
  {
    date: '2026-11-21',
    title: '11 月 21 日 · 周六',
    cards: [
      {
        kind: 'read',
        title: 'We Are Friends',
        tag: `${U3} · p.20–21`,
        tip: 'Read it yourself! 自己读，卡住了再点一下听。',
        sections: [
          { lines: ['I am Tom.', 'You are Amy.', 'We are friends.'] },
          { lines: ['He is John.', 'She is Sue.', 'They are friends.'] },
          { lines: ['She is Ms. Brown.', 'She is my teacher.', 'She is a good teacher.'] },
          { lines: ['We like school.', 'School is fun!'], words: [{ word: 'friends', note: '朋友' }, { word: 'teacher', note: '老师' }, { word: 'school', note: '学校' }] },
        ],
      },
      {
        kind: 'talk',
        title: 'After the Story',
        tag: 'Say it · Full sentence',
        talk: [
          { q: "Who is Tom's friend?", a: 'Amy. She is Amy.' },
          { q: 'Who is Ms. Brown?', a: 'She is a teacher.' },
          { q: 'Do they like school?', a: 'Yes. They like school.' },
        ],
      },
      {
        kind: 'paper',
        title: 'After Reading',
        tag: `${U3} · p.21`,
        tip: '在课本上做：①② 圈出对的词，③④ 勾 Yes 或 No。',
        items: [
          { n: '1', text: 'We is / are friends.', options: ['is', 'are'] },
          { n: '2', text: 'He / She is a good teacher.', options: ['He', 'She'] },
          { n: '3', text: 'They are friends.', options: ['Yes', 'No'] },
          { n: '4', text: "We don't like school.", options: ['Yes', 'No'] },
        ],
      },
      {
        kind: 'paper',
        title: 'Word List',
        tag: `${U3} · p.16–17`,
        tip: '课上没填完的补上：补字母，勾出会读的词。',
        bank: ['I', 'am', 'you', 'are', 'we', 'they', 'he', 'she'],
        items: [],
      },
      {
        kind: 'paper',
        title: 'Write 6 Sentences',
        tag: 'Notebook · Homework',
        tip: '先说再写，一行一句，写你自己的事。检查：I 大写，句首大写，句末有句号。',
        items: [
          { n: '1', text: 'I am ____.', options: ['I am Yoyo.', 'I am seven.'] },
          { n: '2', text: 'You are ____.', options: ['You are my dad.'] },
          { n: '3', text: 'He is ____.', options: ['He is my brother.'] },
          { n: '4', text: 'She is ____.', options: ['She is my mom.'] },
          { n: '5', text: 'We are ____.', options: ['We are a family.'] },
          { n: '6', text: 'They are ____.', options: ['They are my friends.'] },
        ],
      },
    ],
  },
  {
    date: '2026-11-22',
    title: '11 月 22 日 · 周日',
    cards: [
      { kind: 'review', title: 'My 8 Words', tag: 'Unit 3 · Dictation', words: U3_WORDS },
      AM_ARE_IS,
      poster('We Are Friends!', 'u3-we-are-friends', ['I am happy.', 'We are friends.'], 'Point · Say · Play'),
      {
        kind: 'review',
        title: 'Unit 2 Words',
        tag: 'Review · p.17',
        words: [
          { word: 'look', sentence: 'Look!' },
          { word: 'at', sentence: 'Look at the cat.' },
          { word: 'me', sentence: 'Look at me.' },
          { word: 'who', sentence: 'Who is it?' },
          { word: 'this', sentence: 'This is my cat.' },
          { word: 'that', sentence: 'That is a bird.' },
          { word: 'is', sentence: 'It is a cat.' },
          { word: 'not', sentence: 'It is not a dog.' },
        ],
      },
    ],
  },
  // 11/23（周一）线下课讲完 Room on the Broom。作业：听故事几遍、读简化版、用自己的话复述，下次课前可以发复述视频。
  // 每天都有美森 PU 课，所以伊顿这周每天只放十分钟左右：周二到周四每天读一两段，周五串起来，周六录视频，周日休息。
  {
    date: '2026-11-24',
    title: '11 月 24 日 · 周二',
    cards: [
      {
        kind: 'talk',
        title: 'Listen to the Story',
        tag: BROOM_VIDEO,
        tip: 'Watch the video from 0:00 to 7:38. Just listen and enjoy!',
        talk: [{ q: 'Who rides on the broom?', a: 'The witch, the cat, the dog, the bird and the frog.' }],
      },
      storyCard(1, 2),
      {
        kind: 'talk',
        title: 'What Did She Lose?',
        tag: 'Retell · Part 1–2',
        tip: 'Ask and answer with Mum or Dad.',
        talk: [
          { q: 'What did the witch lose first?', a: 'She lost her hat.' },
          { q: 'Who found the hat?', a: 'The dog found it.' },
          { q: 'What did she lose next?', a: 'She lost her bow.' },
          { q: 'Who found the bow?', a: 'The bird found it.' },
          { q: 'What did she lose then?', a: 'She lost her wand.' },
          { q: 'Who found the wand?', a: 'The frog found it.' },
        ],
      },
    ],
  },
  {
    date: '2026-11-25',
    title: '11 月 25 日 · 周三',
    cards: [
      storyCard(3, 4),
      {
        kind: 'talk',
        title: 'What Happened Next?',
        tag: 'Retell · Part 3–4',
        tip: 'Say what happened next. Short sentences are OK!',
        talk: [
          { q: 'All the friends got on the broom. What happened next?', a: 'The broom broke. They fell into the mud.' },
          { q: 'A hungry dragon saw the witch. What happened next?', a: 'The friends hid in the mud. They looked like a big creature.' },
          { q: 'How did the dragon feel?', a: 'The dragon was scared. It flew away.' },
        ],
      },
    ],
  },
  {
    date: '2026-11-26',
    title: '11 月 26 日 · 周四',
    cards: [
      storyCard(5, 5),
      {
        kind: 'review',
        title: "Teacher's Words",
        tag: 'Room on the Broom · Words',
        words: [
          { word: 'ginger', sentence: 'The witch has long ginger hair.' },
          { word: 'plait', sentence: 'She wears her hair in a plait.' },
          { word: 'bow', sentence: 'The bird found her bow.' },
          { word: 'cauldron', sentence: 'She stirs the cauldron.' },
          { word: 'potion', sentence: 'She makes a magic potion.' },
          { word: 'broomstick', sentence: 'They all fly on the broomstick.' },
        ],
      },
      {
        kind: 'talk',
        title: 'Is There Room?',
        tag: 'Act it out',
        tip: 'You are the animal. Mum or Dad is the witch.',
        talk: [
          { q: 'Is there room on the broom for a dog like me?', a: 'Yes!' },
          { q: 'Is there room on the broom for a bird like me?', a: 'Yes, there is!' },
          { q: 'Is there room on the broom for a frog like me?', a: 'Yes, climb on!' },
        ],
      },
    ],
  },
  {
    date: '2026-11-27',
    title: '11 月 27 日 · 周五',
    cards: [
      {
        kind: 'talk',
        title: 'Listen Again',
        tag: BROOM_VIDEO,
        tip: 'Watch the video from 0:00 to 7:38 one more time.',
        talk: [{ q: 'What did the witch say at the end?', a: 'She said thank you.' }],
      },
      RETELL,
    ],
  },
  {
    date: '2026-11-28',
    title: '11 月 28 日 · 周六',
    cards: [
      {
        kind: 'talk',
        title: 'Record Your Story',
        tag: 'Retell · Video for the teacher',
        tip: 'Tell the whole story in your own words. You don’t need to know every word! Mum or Dad records a video.',
        talk: [
          { q: 'How does the story start?', a: 'A witch and her cat fly on a broom.' },
          { q: 'What happened next?', a: 'The wind blew away her hat, her bow and her wand.' },
          { q: 'Who found them?', a: 'A dog, a bird and a frog found them.' },
          { q: 'Then what happened?', a: 'The broom broke and a dragon came.' },
          { q: 'How does the story end?', a: 'The witch makes a new broom. There is room for every friend.' },
        ],
      },
      RETELL,
    ],
  },
]

/** 海报的图片地址（部署在子路径下） */
export const posterUrl = (card: PosterCard) => import.meta.env.BASE_URL + card.image

/** 今天的课；今天没有课时返回 undefined（任务牌上就不显示“看今天的课”） */
export function lessonFor(today: string): EtonLesson | undefined {
  return ETON_LESSONS.find((l) => l.date === today)
}

/**
 * 拼词先用伊顿最近要默写的词（标着 Dictation / Spelling 的复习卡）：
 * 前两周到后一周的课里找，新的单元排前面；一个字母的词（I）不用练。
 */
export function etonSpellWords(today: string): { word: string; sentence: string }[] {
  const day = Date.parse(today)
  const near = ETON_LESSONS.filter((l) => {
    const d = (Date.parse(l.date) - day) / 86400000
    return d >= -13 && d <= 6
  }).sort((a, b) => b.date.localeCompare(a.date))
  const units = new Map<string, { word: string; sentence: string }[]>()
  for (const l of near)
    for (const c of l.cards)
      if (c.kind === 'review' && /dictation|spelling/i.test(c.tag) && !units.has(c.tag)) units.set(c.tag, c.words)
  const seen = new Set<string>()
  return [...units.values()].flat().filter((w) => /^[a-z]{2,}$/i.test(w.word) && !seen.has(w.word.toLowerCase()) && seen.add(w.word.toLowerCase()))
}
