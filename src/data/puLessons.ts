/**
 * 美森英语外教课（Power Up 课本，简称 PU）的课后复习：挂在“美森英语外教课”任务上。
 * 每天都有一节 25 分钟的 PU 课，复习要轻：上完课当天听读一遍故事、答课上的问题（8 分钟左右）；
 * 第二天上新课前花 5 分钟回顾词和故事，再接当天的新课。课上做过的心情、排序题不重复做。
 * 卡片和伊顿课用同一套（点句子能听 Ava 录音）。按日期放，只在那一天显示。
 */
import type { EtonLesson, ReadCard } from './etonLessons'

/** PU1 Unit 4 Lesson 6（文学课）：A picnic with friends */
const PICNIC: ReadCard = {
  kind: 'read',
  title: 'A picnic with friends',
  tag: 'PU1 · Unit 4 · Lesson 6 · Story',
  tip: 'Read slowly. Pause at each full stop.',
  sections: [
    {
      label: '1 · Picnic time',
      lines: ['Mia and Matt want to go on a picnic.', '“Can we cook burgers in the woods, Mum?”', '“No, but you can take sandwiches and fruit.”'],
      words: [{ word: 'picnic', note: '野餐' }, { word: 'burger', note: '汉堡' }, { word: 'woods', note: '树林' }],
    },
    {
      label: '2 · Banana or watermelon?',
      lines: ['Mia likes egg sandwiches.', 'Matt wants chicken sandwiches.', 'He wants lemonade too.', '“Would you like a banana or a watermelon?”', '“A banana, please,” says Mia.', '“A banana and a watermelon, please,” says Matt.'],
      words: [{ word: 'sandwich', note: '三明治' }, { word: 'lemonade', note: '柠檬水' }, { word: 'watermelon', note: '西瓜' }],
    },
    {
      label: '3 · In the woods',
      lines: ['Now they’re in the woods.', 'They’ve got sandwiches, fruit, lemonade and chocolate!', '“Would you like some chocolate, Matt?”', '“Yes, please!”', 'Matt likes chocolate.', '“Here you are.”'],
      words: [{ word: 'chocolate', note: '巧克力' }],
    },
    {
      label: '4 · Go away, birds!',
      lines: ['But what’s this? Birds!', '“Hey! Go away!”', '“We need a scarecrow,” says Mia.', 'They put the watermelon and some clothes on a stick.', 'The birds don’t like the scarecrow.', 'They fly away!', 'Mia and Matt finish eating.'],
      words: [{ word: 'scarecrow', note: '稻草人' }, { word: 'stick', note: '棍子' }],
    },
    {
      label: '5 · Share with friends',
      lines: ['But what about the crumbs?', '“We don’t need the scarecrow now,” says Matt.', 'So Mia takes the scarecrow down.', '“Come on, birds,” calls Matt.', '“Come and eat the crumbs!”', 'It’s good to share your picnic with friends!'],
      words: [{ word: 'crumbs', note: '面包屑' }, { word: 'share', note: '分享' }],
    },
  ],
}

export const PU_LESSONS: EtonLesson[] = [
  {
    date: '2026-11-24',
    title: '11 月 24 日 · PU1 U4 L6',
    cards: [
      PICNIC,
      {
        kind: 'talk',
        title: 'Answer the Questions',
        tag: 'A picnic with friends',
        tip: 'Answer in a whole sentence, like the teacher.',
        talk: [
          { q: 'What do Mia and Matt want to do?', a: 'They want to go on a picnic.' },
          { q: 'What fruits does Matt want?', a: 'He wants a banana and a watermelon.' },
          { q: 'What food do they have?', a: 'They have sandwiches, fruit, lemonade and chocolate.' },
          { q: 'How do they make a scarecrow?', a: 'They put the watermelon and some clothes on a stick.' },
          { q: 'Who eats the crumbs?', a: 'The birds.' },
        ],
      },
    ],
  },
  {
    date: '2026-11-25',
    title: '11 月 25 日 · 课前回顾 L6',
    cards: [
      {
        kind: 'review',
        title: 'Words from Yesterday',
        tag: 'PU1 · Unit 4 · Words',
        words: [
          { word: 'picnic', sentence: 'Let’s have a picnic with our friends!' },
          { word: 'burger', sentence: 'Can we cook burgers in the woods?' },
          { word: 'sandwich', sentence: 'Mia likes egg sandwiches.' },
          { word: 'watermelon', sentence: 'Would you like a banana or a watermelon?' },
        ],
      },
      {
        kind: 'read',
        title: 'Tell the Story',
        tag: 'A picnic with friends · Number the pictures',
        tip: 'Before today’s class: say these four sentences in order. Your own words are OK!',
        sections: [
          { label: '1', lines: ['Mum gives them sandwiches and fruit.'] },
          { label: '2', lines: ['They have a picnic in the woods.'] },
          { label: '3', lines: ['They make a scarecrow with the watermelon and some clothes.'] },
          { label: '4', lines: ['The birds eat the crumbs.'] },
        ],
      },
      {
        kind: 'talk',
        title: 'Would You Like …?',
        tag: 'Act it out',
        tip: 'Mum or Dad asks. You answer!',
        talk: [
          { q: 'Would you like a banana or a watermelon?', a: 'A banana, please.' },
          { q: 'Would you like some chocolate?', a: 'Yes, please!' },
          { q: 'Here you are.', a: 'Thank you!' },
        ],
      },
    ],
  },
]

export function puLessonFor(today: string): EtonLesson | undefined {
  return PU_LESSONS.find((l) => l.date === today)
}
