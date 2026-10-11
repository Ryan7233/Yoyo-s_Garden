import { db, uid } from './schema'

export async function addInventory(childId: string, catalogId: string, n: number) {
  const row = await db.inventory.where({ childId, catalogId }).first()
  if (row) await db.inventory.update(row.id, { count: row.count + n })
  else await db.inventory.add({ id: uid(), childId, catalogId, count: n })
}

export async function takeInventory(childId: string, catalogId: string, n = 1): Promise<boolean> {
  const row = await db.inventory.where({ childId, catalogId }).first()
  if (!row || row.count < n) return false
  if (row.count === n) await db.inventory.delete(row.id)
  else await db.inventory.update(row.id, { count: row.count - n })
  return true
}
