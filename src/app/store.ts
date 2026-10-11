import { create } from 'zustand'
import { db } from '../db/schema'
import type {
  Child, InventoryItem, LedgerEntry, PlacedItem, PlantInstance, Plot, Settings, TaskDef, TaskRecord, Unlock,
} from '../data/types'
import { balanceOf, type Balance } from '../engine/ledger'
import { toTaskDay } from '../engine/taskDay'

export type Page = 'garden' | 'house' | 'tasks' | 'shop' | 'bag' | 'codex' | 'decorate'

interface State {
  loaded: boolean
  child: Child | null
  settings: Settings | null
  tasks: TaskDef[]
  records: TaskRecord[]
  ledger: LedgerEntry[]
  plots: Plot[]
  plants: PlantInstance[]
  placed: PlacedItem[]
  inventory: InventoryItem[]
  unlocks: Unlock[]
  balance: Balance
  today: string

  page: Page
  parentOpen: boolean

  load: () => Promise<void>
  go: (page: Page) => void
  setParentOpen: (open: boolean) => void
  tick: () => void
}

export const useStore = create<State>((set, get) => ({
  loaded: false,
  child: null,
  settings: null,
  tasks: [],
  records: [],
  ledger: [],
  plots: [],
  plants: [],
  placed: [],
  inventory: [],
  unlocks: [],
  balance: { coin: 0, drop: 0 },
  today: toTaskDay(new Date()),
  page: 'garden',
  parentOpen: false,

  async load() {
    const child = (await db.children.toCollection().first()) ?? null
    const settings = (await db.settings.get('settings')) ?? null
    if (!child) {
      set({ loaded: true, child: null, settings })
      return
    }
    const id = child.id
    const [tasks, records, ledger, plots, plants, placed, inventory, unlocks] = await Promise.all([
      db.tasks.where('childId').equals(id).sortBy('order'),
      db.taskRecords.where('childId').equals(id).sortBy('createdAt'),
      db.ledger.where('childId').equals(id).sortBy('at'),
      db.plots.where('childId').equals(id).toArray(),
      db.plants.where('childId').equals(id).toArray(),
      db.placed.where('childId').equals(id).toArray(),
      db.inventory.where('childId').equals(id).toArray(),
      db.unlocks.where('childId').equals(id).toArray(),
    ])
    set({
      loaded: true, child, settings, tasks, records, ledger, plots, plants, placed, inventory, unlocks,
      balance: balanceOf(ledger),
      today: toTaskDay(new Date()),
    })
  },

  go(page) {
    set({ page })
  },
  setParentOpen(open) {
    set({ parentOpen: open })
  },
  /** 跨过 00:00 时刷新“今天” */
  tick() {
    const today = toTaskDay(new Date())
    if (today !== get().today) set({ today })
  },
}))

/** 执行一个写操作后重新加载 */
export async function act<T>(fn: () => Promise<T>): Promise<T> {
  const r = await fn()
  await useStore.getState().load()
  return r
}
