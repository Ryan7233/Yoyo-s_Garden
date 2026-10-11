// 所有可调数值集中在这里（见 SPEC 第 4、5 节）

export const BALANCE = {
  /** “今日必做”上限，超过只提示不拦截 */
  requiredCap: 6,
  /** 补录窗口：今天和前 N 天 */
  backfillDays: 2,

  /** 当日全勤奖励 */
  allDoneCoins: 5,
  /** 连续全勤 N 天奖励 */
  streakDays: 3,
  streakCoins: 3,

  /** 运动 */
  exercisePerItemCoins: 2,
  exerciseTargetBonusCoins: 1,
  exercisePersonalBestCoins: 5,
  exerciseAllFiveCoins: 3,
  exerciseAllFiveDrops: 2,

  /** 家长加分可选分值 */
  bonusValues: [2, 3, 5] as const,
  bonusReasons: ['主动做家务', '照顾弟弟', '讲一件学校的事', '读写坐姿端正'],

  /** 花园 */
  gridWidth: 12,
  gridHeight: 8,
  plotExpandCost: 20,
  maxPlots: 24,
  thirstyAfterDays: 3,
  /** 家具半价卖回 */
  sellRatio: 0.5,
  /** 果实卖出价 = 收获金币 × 该比例（向上取整） */
  fruitSellRatio: 0.5,

  /** 室内 */
  indoorWidth: 8,
  indoorHeight: 5,
  wallSlots: 8,

  /** 特殊植物 */
  specialSeedPrice: 30,
  specialWaterToMature: 7,
  specialHarvestCoins: 20,

  /** 首次访客奖励 */
  visitorFirstCoins: 5,

  /** 家长模式 */
  pinMaxTries: 5,
  pinLockMs: 60_000,
  parentIdleMs: 120_000,
  backupRemindDays: 7,

  /** 初始赠送 */
  starter: {
    drops: 5,
    seeds: [
      { catalogId: 'seed-sunflower', count: 3 },
      { catalogId: 'seed-strawberry', count: 2 },
    ],
  },
} as const
