import { describe, expect, it } from 'vitest'
import { applyV10Tasks, defaultTasks } from './tasks'

// 版本 9 时的样子：学校作业必做排第 2，语文阅读非必做，课文背诵是旧名字
const v9 = () =>
  defaultTasks('c').map((t) => {
    if (t.id === 'homework') return { ...t, enabled: true, required: true, order: 1, schedule: { kind: 'weekdays' as const, days: [1, 2, 3, 4, 5] } }
    if (t.id === 'chinese-reading') return { ...t, name: '语文阅读', hint: '分级读物 15 分钟，能讲一句读了什么', required: false, order: 6 }
    if (t.id === 'recite') return { ...t, name: '课文背诵', hint: '背给家长听' }
    if (t.id === 'spelling') return { ...t, name: '拼 3 个词', hint: '每天 3 个新词，自动从易到难，也可以在拼写本里加书里的词：看、读、盖住、写、对照，再听写复习词' }
    return t
  })

describe('版本 10：学校作业换成每日中文阅读', () => {
  it('学校作业关掉；每日中文阅读必做、每天、顶到学校作业的位置；课文背诵改名', () => {
    const next = applyV10Tasks(v9())
    const by = (id: string) => next.find((t) => t.id === id)!
    expect(by('homework')).toMatchObject({ enabled: false, required: false })
    expect(by('chinese-reading')).toMatchObject({ name: '每日中文阅读', required: true, enabled: true, order: 1, schedule: { kind: 'daily' } })
    expect(by('chinese-reading').hint).toContain('阅读银行')
    expect(by('recite').name).toBe('课文朗读和背诵')
    expect(by('spelling').name).toBe('每日拼词')
    expect(by('spelling').hint).toContain('1 个新词')
  })
  it('家长自己改过的名字不动', () => {
    const custom = v9().map((t) => (t.id === 'chinese-reading' ? { ...t, name: '读绘本' } : t))
    expect(applyV10Tasks(custom).find((t) => t.id === 'chinese-reading')!.name).toBe('读绘本')
  })
  it('新档案默认就是新样子', () => {
    const t = defaultTasks('c')
    expect(t.find((x) => x.id === 'homework')!.enabled).toBe(false)
    expect(t.find((x) => x.id === 'chinese-reading')).toMatchObject({ name: '每日中文阅读', required: true })
  })
})
