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

export type LessonCard = WordCard | TopicCard | VerbsCard | BookCard | CompareCard | TalkCard | ReviewCard | VocabCard | SortCard | PickCard | ReadCard | PaperCard

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
      {
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
      },
    ],
  },
]

/** 今天的课；今天没有课时返回 undefined（任务牌上就不显示“看今天的课”） */
export function lessonFor(today: string): EtonLesson | undefined {
  return ETON_LESSONS.find((l) => l.date === today)
}
