import { useStore, act } from './store'
import { getCatalogItem } from '../data/catalog'
import { VISITORS } from '../data/visitors'
import { BADGES } from '../data/badges'
import { BALANCE } from '../data/balance'
import { describeUnlock } from '../data/unlocks'
import { markUnlocksSeen } from '../db/progress'
import { Modal } from '../ui/Modal'
import { Mascot } from '../ui/Mascot'
import { Celebrate } from '../ui/Celebrate'
import { Icon } from '../ui/Icon'
import type { Unlock } from '../data/types'
import { useEffect } from 'react'
import { play } from '../ui/sfx'

/** 新解锁的特殊物品、第一次来访的小动物、新徽章：孩子下次打开时看到 */
export function UnlockNotices() {
  const unlocks = useStore((s) => s.unlocks)
  const fresh = unlocks.filter((u) => !u.seenAt && u.kind !== 'codex')
  const has = fresh.length > 0
  useEffect(() => {
    if (has) play('fanfare')
  }, [has])
  if (!has) return null
  const close = () => act(() => markUnlocksSeen(fresh.map((u) => u.id)))
  return (
    <>
      <Celebrate />
      <Modal onClose={close}>
        <Mascot size={88} bounce />
        <h2 className="modal-title">有好消息！</h2>
        <div className="notice-list">
          {fresh.map((u) => <Notice key={u.id} u={u} />)}
        </div>
        <button className="btn btn-primary btn-big" onClick={close}>太好啦</button>
      </Modal>
    </>
  )
}

function Notice({ u }: { u: Unlock }) {
  let icon = '🎁'
  let text = ''
  if (u.kind === 'item') {
    const item = getCatalogItem(u.refId)
    if (!item) return null
    icon = item.icon
    const why = item.unlock ? `因为你${describeUnlock(item.unlock)}，` : ''
    text = item.plant ? `${why}解锁了${item.name}！送你 1 颗种子，快去种下吧` : `${why}得到了${item.name}！已经放进背包，去装扮里摆上吧`
  } else if (u.kind === 'visitor') {
    const v = VISITORS.find((x) => x.id === u.refId)
    if (!v) return null
    icon = v.icon
    text = `${v.name}第一次来做客：“${v.line}” 送你 ${BALANCE.visitorFirstCoins} 金币`
  } else if (u.kind === 'badge') {
    const b = BADGES.find((x) => x.id === u.refId)
    if (!b) return null
    icon = b.icon
    text = `获得徽章「${b.name}」：${b.desc}`
  }
  return (
    <div className="notice-row card pop">
      <Icon icon={icon} size={48} />
      <span>{text}</span>
    </div>
  )
}
