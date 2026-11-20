import { describe, expect, it } from 'vitest'
import { TASK_NOTES, taskNoteFor } from './taskNotes'
import { defaultTasks } from './tasks'
import { reciteFor, recitesFor } from './reciteTexts'
import { pinyinCardFor } from './pinyinCards'
import { mathHomeworkFor } from './mathHomework'

describe('11/17 的作业都放进原来的任务里', () => {
  it('只挂在已有的任务上，不新开任务', () => {
    const ids = defaultTasks('c').map((t) => t.id)
    for (const n of TASK_NOTES) expect(ids).toContain(n.taskId)
  })
  it('字词听写在“写字”，读书 15 分钟在“语文阅读”，学校作业不弹卡', () => {
    expect(taskNoteFor('writing', '2026-11-17')?.title).toContain('听写')
    for (const d of ['2026-11-17', '2026-11-20', '2026-11-22']) {
      const n = taskNoteFor('chinese-reading', d)
      expect(n?.teacher).toContain('阅读银行')
      expect(n?.steps[0].timer).toBe(15)
      expect(n?.date).toBe(d)
    }
    expect(taskNoteFor('homework', '2026-11-17')).toBeUndefined()
    expect(taskNoteFor('writing', '2026-11-18')).toBeUndefined()
  })
  it('《秋天》从周二背到周四老师查，周五就不显示了', () => {
    expect(reciteFor('2026-11-16')).toBeUndefined()
    for (const d of ['2026-11-17', '2026-11-18', '2026-11-19']) expect(reciteFor(d)?.title).toBe('秋天')
    expect(reciteFor('2026-11-20')).toBeUndefined()
  })
  it('《比尾巴》（读熟 3 遍）和《秋天》（背）都挂在课文朗读和背诵上', () => {
    expect(recitesFor('2026-11-18').map((t) => t.title)).toEqual(['秋天', '比尾巴'])
    expect(recitesFor('2026-11-20')).toEqual([])
    const t = reciteFor('2026-11-18', 'read')
    expect(t?.title).toBe('比尾巴')
    expect(t?.goal).toBe(3)
    expect(t?.paragraphs).toHaveLength(4)
    expect(reciteFor('2026-11-17', 'read')).toBeUndefined()
    expect(reciteFor('2026-11-20', 'read')).toBeUndefined()
    expect(reciteFor('2026-11-18')?.title).toBe('秋天')
  })
  it('看图写拼音第二单元 9 个词都有答案；数学三个办法', () => {
    expect(pinyinCardFor('2026-11-17')?.answers).toHaveLength(9)
    expect(mathHomeworkFor('2026-11-17')?.prompts.map((p) => p.kind)).toEqual(['添加', '移除', '重新分配'])
  })
})
