import { describe, expect, it } from 'vitest'
import { DEFAULT_EXERCISES } from '../data/exercises'
import type { ExerciseRecord } from '../data/types'
import {
  bestTodayByExercise, canChallengeRecord, confirmVideoRecord, countdownLeft, doneIdsOn, exerciseRewardEntries,
  exercisesForDay, formatSeconds, parseExerciseValue, personalBestOf, reachesTarget, rewardForLog, stopwatchSeconds,
  suggestRaiseTarget,
} from './exercise'

const [jump, reach, plank, hang, situp] = DEFAULT_EXERCISES
const DAY = '2026-10-17'

let n = 0
function rec(p: Partial<ExerciseRecord>): ExerciseRecord {
  n++
  return {
    id: `r${n}`, childId: 'c', exerciseId: 'plank', date: DAY, value: 10, isPersonalBest: false,
    status: 'done', createdAt: `2026-10-17T10:00:${String(n).padStart(2, '0')}Z`, recordAttempt: false, ...p,
  }
}

describe('计时器', () => {
  it('60 秒倒计时向上取整，到 0 为止', () => {
    expect(countdownLeft(0, 0)).toBe(60)
    expect(countdownLeft(0, 400)).toBe(60)
    expect(countdownLeft(0, 59_100)).toBe(1)
    expect(countdownLeft(0, 60_000)).toBe(0)
    expect(countdownLeft(0, 75_000)).toBe(0)
  })
  it('正计时按整秒记录', () => {
    expect(stopwatchSeconds(1000, 1999)).toBe(0)
    expect(stopwatchSeconds(1000, 32_900)).toBe(31)
    expect(stopwatchSeconds(1000, 500)).toBe(0)
  })
  it('显示 m:ss', () => {
    expect(formatSeconds(5)).toBe('0:05')
    expect(formatSeconds(75)).toBe('1:15')
  })
})

describe('数值录入', () => {
  it('个数和秒数只收非负整数', () => {
    expect(parseExerciseValue('105', 'count')).toBe(105)
    expect(parseExerciseValue(' 30 ', 'seconds')).toBe(30)
    expect(parseExerciseValue('-3', 'count')).toBeNull()
    expect(parseExerciseValue('3.5', 'count')).toBeNull()
    expect(parseExerciseValue('', 'count')).toBeNull()
    expect(parseExerciseValue('abc', 'seconds')).toBeNull()
    expect(parseExerciseValue('5000', 'count')).toBeNull()
  })
  it('体前屈可以是负数，可带一位小数', () => {
    expect(parseExerciseValue('-4', 'cm')).toBe(-4)
    expect(parseExerciseValue('－4.5', 'cm')).toBe(-4.5)
    expect(parseExerciseValue('6.5', 'cm')).toBe(6.5)
    expect(parseExerciseValue('-0', 'cm')).toBe(0)
    expect(parseExerciseValue('6.25', 'cm')).toBeNull()
    expect(parseExerciseValue('80', 'cm')).toBeNull()
  })
})

describe('频率', () => {
  it('只显示当天安排的子项', () => {
    const defs = [jump, { ...plank, days: [1, 3, 5] }]
    expect(exercisesForDay(defs, '2026-10-17').map((d) => d.id)).toEqual(['jump-rope']) // 周六
    expect(exercisesForDay(defs, '2026-10-16').map((d) => d.id)).toEqual(['jump-rope', 'plank']) // 周五
  })
})

describe('个人纪录与目标', () => {
  it('只有确认过的见证纪录才算个人最好', () => {
    const records = [
      rec({ value: 50 }), // 没见证
      rec({ value: 30, isPersonalBest: true }),
      rec({ value: 40, isPersonalBest: true, status: 'revoked' }),
      rec({ value: 45, status: 'pending', recordAttempt: true, witness: 'video' }),
      rec({ exerciseId: 'hang', value: 99, isPersonalBest: true }),
    ]
    expect(personalBestOf(records, 'plank')).toBe(30)
    expect(personalBestOf(records, 'sit-up')).toBeNull()
  })
  it('超过个人最好才问要不要挑战；还没有纪录时第一次就是纪录', () => {
    expect(canChallengeRecord(5, null)).toBe(true)
    expect(canChallengeRecord(31, 30)).toBe(true)
    expect(canChallengeRecord(30, 30)).toBe(false)
    expect(canChallengeRecord(-2, -5)).toBe(true)
  })
  it('没有目标的子项不判定达标', () => {
    expect(reachesTarget(jump, 100)).toBe(true)
    expect(reachesTarget(jump, 99)).toBe(false)
    expect(reachesTarget(hang, 1000)).toBe(false)
  })
  it('当天做过的子项不含撤销的；当天最好取最大值', () => {
    const records = [rec({ value: 20 }), rec({ value: 35 }), rec({ exerciseId: 'hang', status: 'revoked' }), rec({ date: '2026-10-16', exerciseId: 'sit-up' })]
    expect(doneIdsOn(records, DAY)).toEqual(['plank', 'plank'])
    expect(bestTodayByExercise(records, DAY).get('plank')?.value).toBe(35)
    expect(bestTodayByExercise(records, DAY).has('hang')).toBe(false)
  })
  it('最近 3 天都达标时提示提高目标', () => {
    const days = ['2026-10-14', '2026-10-15', '2026-10-16']
    expect(suggestRaiseTarget(plank, days.map((date) => rec({ date, value: 35 })))).toBe(true)
    expect(suggestRaiseTarget(plank, days.map((date, i) => rec({ date, value: i === 2 ? 20 : 35 })))).toBe(false)
    expect(suggestRaiseTarget(plank, days.slice(1).map((date) => rec({ date, value: 35 })))).toBe(false)
    expect(suggestRaiseTarget(hang, days.map((date) => rec({ date, exerciseId: 'hang', value: 35 })))).toBe(false)
  })
})

describe('记录成绩的奖励', () => {
  const scheduled = DEFAULT_EXERCISES
  it('日常练习：做了 +2，达标再 +1，不见证不算纪录', () => {
    const r = rewardForLog({ def: plank, value: 40, day: DAY, scheduled, records: [], witnessed: false })
    expect(r).toMatchObject({ coins: 3, isPersonalBest: false, reachedTarget: true })
  })
  it('家长见证的破纪录 +5', () => {
    const records = [rec({ value: 30, isPersonalBest: true, date: '2026-10-10' })]
    const r = rewardForLog({ def: plank, value: 35, day: DAY, scheduled, records, witnessed: true })
    expect(r).toMatchObject({ coins: 8, isPersonalBest: true })
    expect(rewardForLog({ def: plank, value: 30, day: DAY, scheduled, records, witnessed: true }).isPersonalBest).toBe(false)
  })
  it('当天安排的子项都做了才有五项奖励；撤销的不算', () => {
    const others = [jump, reach, hang].map((d) => rec({ exerciseId: d.id }))
    const r = rewardForLog({ def: situp, value: 20, day: DAY, scheduled, records: [...others, rec({ exerciseId: 'plank' })], witnessed: false })
    expect([r.coins, r.drops, r.allFive]).toEqual([5, 2, true])
    const r2 = rewardForLog({ def: situp, value: 20, day: DAY, scheduled, records: [...others, rec({ exerciseId: 'plank', status: 'revoked' })], witnessed: false })
    expect(r2.allFive).toBe(false)
  })
  it('家长只安排了部分子项时，做完当天安排的就算全做', () => {
    const r = rewardForLog({ def: jump, value: 10, day: DAY, scheduled: [jump, plank], records: [rec({ exerciseId: 'plank' })], witnessed: false })
    expect(r.allFive).toBe(true)
  })
  it('拆分流水：日常练习记 exercise，纪录奖励记 personalBest', () => {
    const record = rec({ id: 'x' })
    const entries = exerciseRewardEntries(record, { coins: 11, drops: 2, isPersonalBest: true, reachedTarget: true, allFive: true })
    expect(entries).toEqual([
      { date: DAY, refId: 'x', currency: 'coin', amount: 6, reason: 'exercise' },
      { date: DAY, refId: 'x', currency: 'drop', amount: 2, reason: 'exercise' },
      { date: DAY, refId: 'x', currency: 'coin', amount: 5, reason: 'personalBest' },
    ])
    expect(exerciseRewardEntries(record, { coins: 0, drops: 0, isPersonalBest: false, reachedTarget: false, allFive: false })).toEqual([])
  })
})

describe('视频见证确认', () => {
  it('确认时仍超过纪录才发纪录奖励', () => {
    const video = rec({ id: 'v', value: 40, status: 'pending', witness: 'video', recordAttempt: true })
    const ok = confirmVideoRecord(video, [video, rec({ value: 30, isPersonalBest: true })])
    expect(ok.isPersonalBest).toBe(true)
    expect(ok.entries).toEqual([{ date: DAY, refId: 'v', currency: 'coin', amount: 5, reason: 'personalBest' }])
    // 等待期间家长当场见证了一个更好的成绩
    const late = confirmVideoRecord(video, [video, rec({ value: 45, isPersonalBest: true })])
    expect(late).toEqual({ isPersonalBest: false, entries: [] })
  })
})
