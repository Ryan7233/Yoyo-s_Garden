import { create } from 'zustand'
import { db } from '../db/schema'
import type { ExerciseConfig } from '../db/schema'
import type {
  Child, ExerciseRecord, InventoryItem, LedgerEntry, PlacedItem, PlantInstance, Plot, Settings, TaskDef, TaskRecord, Unlock,
} from '../data/types'
import { balanceOf, type Balance } from '../engine/ledger'
import { toTaskDay } from '../engine/taskDay'
import { DEFAULT_EXERCISES } from '../data/exercises'

export type Page = 'tasks' | 'shop' | 'bag' | 'codex'
export type SceneName = 'garden' | 'house'

interface State {
  loaded: boolean
  child: Child | null
  settings: Settings | null
  tasks: TaskDef[]
  records: TaskRecord[]
  exercises: ExerciseConfig[]
  exerciseRecords: ExerciseRecord[]
  ledger: LedgerEntry[]
  plots: Plot[]
  plants: PlantInstance[]
  placed: PlacedItem[]
  inventory: InventoryItem[]
  unlocks: Unlock[]
  balance: Balance
  today: string

  /** 打开的面板（null 表示只看场景） */
  page: Page | null
  scene: SceneName
  decorating: boolean
  parentOpen: boolean

  load: () => Promise<void>
  go: (page: Page | null) => void
  setScene: (scene: SceneName) => void
  setDecorating: (on: boolean) => void
  setParentOpen: (open: boolean) => void
  tick: () => void
}

export const useStore = create<State>((set, get) => ({
  loaded: false,
  child: null,
  settings: null,
  tasks: [],
  records: [],
  exercises: [],
  exerciseRecords: [],
  ledger: [],
  plots: [],
  plants: [],
  placed: [],
  inventory: [],
  unlocks: [],
  balance: { coin: 0, drop: 0 },
  today: toTaskDay(new Date()),
  page: null,
  scene: 'garden',
  decorating: false,
  parentOpen: false,

  async load() {
    const child = (await db.children.toCollection().first()) ?? null
    const settings = (await db.settings.get('settings')) ?? null
    if (!child) {
      set({ loaded: true, child: null, settings })
      return
    }
    const id = child.id
    const [tasks, records, exercises, exerciseRecords, ledger, plots, plants, placed, inventory, unlocks] = await Promise.all([
      db.tasks.where('childId').equals(id).sortBy('order'),
      db.taskRecords.where('childId').equals(id).sortBy('createdAt'),
      db.exercises.where('childId').equals(id).toArray().then(sortExercises),
      db.exerciseRecords.where('childId').equals(id).sortBy('createdAt'),
      db.ledger.where('childId').equals(id).sortBy('at'),
      db.plots.where('childId').equals(id).toArray(),
      db.plants.where('childId').equals(id).toArray(),
      db.placed.where('childId').equals(id).toArray(),
      db.inventory.where('childId').equals(id).toArray(),
      db.unlocks.where('childId').equals(id).toArray(),
    ])
    set({
      loaded: true, child, settings, tasks, records, exercises, exerciseRecords, ledger, plots, plants, placed, inventory, unlocks,
      balance: balanceOf(ledger),
      today: toTaskDay(new Date()),
    })
  },

  go(page) {
    set({ page })
  },
  setScene(scene) {
    set({ scene })
  },
  setDecorating(on) {
    set({ decorating: on, page: null })
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

const EXERCISE_ORDER = DEFAULT_EXERCISES.map((e) => e.id)
function sortExercises(list: ExerciseConfig[]): ExerciseConfig[] {
  return list.sort((a, b) => EXERCISE_ORDER.indexOf(a.id) - EXERCISE_ORDER.indexOf(b.id))
}

/** 执行一个写操作后重新加载 */
export async function act<T>(fn: () => Promise<T>): Promise<T> {
  const r = await fn()
  await useStore.getState().load()
  return r
}
