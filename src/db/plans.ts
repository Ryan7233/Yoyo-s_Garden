// 按日期保存任务配置：把还没冻结的过去日子用当前配置冻结（今天不冻结）
import { db } from './schema'
import { daysToFreeze, freezePlan, planResolver, type PlanOf } from '../engine/plans'
import { toTaskDay } from '../engine/taskDay'

/** 家长改任务之前、每次打开应用时调用。幂等 */
export async function ensureDayPlans(childId: string, now = new Date()) {
  await db.transaction('rw', [db.children, db.tasks, db.dayPlans], async () => {
    const child = await db.children.get(childId)
    if (!child) return
    const existing = await db.dayPlans.where('childId').equals(childId).primaryKeys()
    const days = daysToFreeze(toTaskDay(new Date(child.createdAt)), toTaskDay(now), new Set(existing.map(([, d]) => d)))
    if (!days.length) return
    const tasks = await db.tasks.where('childId').equals(childId).toArray()
    await db.dayPlans.bulkPut(days.map((d) => freezePlan(tasks, childId, d)))
  })
}

/** 读出这个孩子每天的任务配置 */
export async function loadPlanOf(childId: string): Promise<PlanOf> {
  const [tasks, plans] = await Promise.all([
    db.tasks.where('childId').equals(childId).toArray(),
    db.dayPlans.where('childId').equals(childId).toArray(),
  ])
  return planResolver(tasks, plans)
}
