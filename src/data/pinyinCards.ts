/**
 * 每日拼读：老师发的拼读小卡片图片，放在 public/pinyin/ 下，按日期只在那一天弹出。
 * 换图：把图放进 public/pinyin/，在下面加一行（旧的可以删掉，图也一起删）。
 */
export interface PinyinCard {
  date: string
  title: string
  /** public 下的路径 */
  image: string
  /** 写拼音的作业：她在纸上写完，点开对答案（词 + 拼音） */
  answers?: { word: string; pinyin: string }[]
  /** 这张卡怎么做（不写就是读拼读卡） */
  tip?: string
}

export const PINYIN_CARDS: PinyinCard[] = [
  { date: '2026-11-03', title: '第 11–12 天 · ao ou iu', image: 'pinyin/2026-11-03.jpg' },
  { date: '2026-11-04', title: '第 14–15 天 · ie üe er', image: 'pinyin/2026-11-04.jpg' },
  { date: '2026-11-05', title: '第 16 天 · an en in un ün', image: 'pinyin/2026-11-05.jpg' },
  { date: '2026-11-09', title: '第 17–18 天 · ang eng ing ong', image: 'pinyin/2026-11-09.jpg' },
  { date: '2026-11-16', title: '词语拼读 · 鞋子、打雷、望远镜…', image: 'pinyin/2026-11-16.jpg' },
  {
    date: '2026-11-17',
    title: '看图写拼音 · 第二单元',
    image: 'pinyin/2026-11-17.jpg',
    tip: '看图，在练习纸的格子里写出拼音，再把这些词读几遍。写完点下面“对答案”。',
    answers: [
      { word: '爸爸', pinyin: 'bà ba' },
      { word: '妈妈', pinyin: 'mā ma' },
      { word: '大地', pinyin: 'dà dì' },
      { word: '马路', pinyin: 'mǎ lù' },
      { word: '泥土', pinyin: 'ní tǔ' },
      { word: '蜡笔', pinyin: 'là bǐ' },
      { word: '大米', pinyin: 'dà mǐ' },
      { word: '扶梯', pinyin: 'fú tī' },
      { word: '地图', pinyin: 'dì tú' },
    ],
  },
  {
    date: '2026-11-23',
    title: '看图写拼音 · 第三、四单元（明天默写）',
    image: 'pinyin/2026-11-23.jpg',
    tip: '明天默写。看图把拼音写在练习纸上（词多，可以先写第三单元，歇一会儿再写第四单元），写完点下面“对答案”，错的圈出来再读几遍。“字”“词”“句子”三格写的就是这三个词的拼音。',
    answers: [
      // 第三单元（29 个，按练习纸的顺序）
      { word: '哥哥', pinyin: 'gē ge' },
      { word: '弟弟', pinyin: 'dì di' },
      { word: '画画', pinyin: 'huà huà' },
      { word: '荷花', pinyin: 'hé huā' },
      { word: '打鼓', pinyin: 'dǎ gǔ' },
      { word: '下棋', pinyin: 'xià qí' },
      { word: '搭积木', pinyin: 'dā jī mù' },
      { word: '字', pinyin: 'zì' },
      { word: '词', pinyin: 'cí' },
      { word: '句子', pinyin: 'jù zi' },
      { word: '擦桌子', pinyin: 'cā zhuō zi' },
      { word: '折纸', pinyin: 'zhé zhǐ' },
      { word: '读书', pinyin: 'dú shū' },
      { word: '鱼', pinyin: 'yú' },
      { word: '鸭子', pinyin: 'yā zi' },
      { word: '乌鸦', pinyin: 'wū yā' },
      { word: '蚂蚁', pinyin: 'mǎ yǐ' },
      { word: '字母', pinyin: 'zì mǔ' },
      { word: '蜘蛛', pinyin: 'zhī zhū' },
      { word: '喝茶', pinyin: 'hē chá' },
      { word: '书架', pinyin: 'shū jià' },
      { word: '刷牙', pinyin: 'shuā yá' },
      { word: '骑马', pinyin: 'qí mǎ' },
      { word: '拖地', pinyin: 'tuō dì' },
      { word: '理发', pinyin: 'lǐ fà' },
      { word: '宿舍', pinyin: 'sù shè' },
      { word: '擦玻璃', pinyin: 'cā bō li' },
      { word: '吃西瓜', pinyin: 'chī xī guā' },
      { word: '拔萝卜', pinyin: 'bá luó bo' },
      // 第四单元（43 个）
      { word: '白菜', pinyin: 'bái cài' },
      { word: '蔬菜', pinyin: 'shū cài' },
      { word: '鸭梨', pinyin: 'yā lí' },
      { word: '西瓜', pinyin: 'xī guā' },
      { word: '水果', pinyin: 'shuǐ guǒ' },
      { word: '小桥', pinyin: 'xiǎo qiáo' },
      { word: '流水', pinyin: 'liú shuǐ' },
      { word: '垂柳', pinyin: 'chuí liǔ' },
      { word: '桃花', pinyin: 'táo huā' },
      { word: '写作业', pinyin: 'xiě zuò yè' },
      { word: '梅花开', pinyin: 'méi huā kāi' },
      { word: '雪花飘', pinyin: 'xuě huā piāo' },
      { word: '夜色美', pinyin: 'yè sè měi' },
      { word: '轮船', pinyin: 'lún chuán' },
      { word: '蓝天', pinyin: 'lán tiān' },
      { word: '白云', pinyin: 'bái yún' },
      { word: '草原', pinyin: 'cǎo yuán' },
      { word: '森林', pinyin: 'sēn lín' },
      { word: '明亮', pinyin: 'míng liàng' },
      { word: '游泳', pinyin: 'yóu yǒng' },
      { word: '滑冰', pinyin: 'huá bīng' },
      { word: '骑自行车', pinyin: 'qí zì xíng chē' },
      { word: '打乒乓球', pinyin: 'dǎ pīng pāng qiú' },
      { word: '昨晚', pinyin: 'zuó wǎn' },
      { word: '今天', pinyin: 'jīn tiān' },
      { word: '明天', pinyin: 'míng tiān' },
      { word: '这个', pinyin: 'zhè ge' },
      { word: '去年', pinyin: 'qù nián' },
      { word: '写字', pinyin: 'xiě zì' },
      { word: '打雷', pinyin: 'dǎ léi' },
      { word: '帽子', pinyin: 'mào zi' },
      { word: '叠被子', pinyin: 'dié bèi zi' },
      { word: '吹气球', pinyin: 'chuī qì qiú' },
      { word: '堆雪人', pinyin: 'duī xuě rén' },
      { word: '丢手绢', pinyin: 'diū shǒu juàn' },
      { word: '水壶', pinyin: 'shuǐ hú' },
      { word: '苹果', pinyin: 'píng guǒ' },
      { word: '跳棋', pinyin: 'tiào qí' },
      { word: '面包', pinyin: 'miàn bāo' },
      { word: '饼干', pinyin: 'bǐng gān' },
      { word: '雨伞', pinyin: 'yǔ sǎn' },
      { word: '水彩笔', pinyin: 'shuǐ cǎi bǐ' },
      { word: '望远镜', pinyin: 'wàng yuǎn jìng' },
    ],
  },
]

export function pinyinCardFor(today: string): PinyinCard | undefined {
  return PINYIN_CARDS.find((c) => c.date === today)
}

export function pinyinImageUrl(card: PinyinCard): string {
  return import.meta.env.BASE_URL + card.image
}

/** 65 → “1分05秒”，和卡片上的写法一样 */
export function formatReadTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m ? `${m}分${String(s).padStart(2, '0')}秒` : `${s}秒`
}
