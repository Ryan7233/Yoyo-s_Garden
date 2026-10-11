import { useState } from 'react'
import { useStore, act } from '../../app/store'
import { getCatalogItem } from '../../data/catalog'
import { harvestInfo } from '../../data/plants'
import { canHarvest, canWater, isThirsty } from '../../engine/growth'
import { digUp, harvestPlant, waterPlant } from '../../db/garden'
import { Modal, ConfirmDialog } from '../../ui/Modal'
import { Celebrate } from '../../ui/Celebrate'
import { toast } from '../../ui/Toast'
import { PlantArt } from './PlantArt'

const STAGE = ['种子', '发芽了', '长大了', '开花啦']

export function PlantSheet({ plantId, onClose, onWatered }: { plantId: string; onClose: () => void; onWatered: (id: string, stageUp: boolean) => void }) {
  const { plants, today, balance } = useStore()
  const [digging, setDigging] = useState(false)
  const [party, setParty] = useState(0)
  const plant = plants.find((p) => p.id === plantId)
  const item = plant && getCatalogItem(plant.catalogId)
  const spec = item?.plant
  if (!plant || !item || !spec) return party ? <Celebrate key={party} /> : null

  const ready = canHarvest(plant, spec)
  const waterable = canWater(plant, today, spec)
  const thirsty = isThirsty(plant, today, spec)
  const fruitWord = harvestInfo(spec.harvestItem ?? '')?.kind === 'fruit' ? '结果啦' : '开花啦'
  const stageLabel = plant.stage === 3 ? (spec.harvestItem ? fruitWord : '长成啦') : STAGE[plant.stage]
  const grown = Math.min(plant.waterCount, spec.waterToMature)

  const doWater = async () => {
    const r = await act(() => waterPlant(plant.id))
    if (r.ok) {
      onWatered(plant.id, r.stageUp)
      onClose()
    } else if (r.reason === 'drops') toast('水滴用完啦，完成任务可以得到水滴 💧')
  }

  const doHarvest = async () => {
    const r = await act(() => harvestPlant(plant.id))
    if (!r) return
    setParty((n) => n + 1)
    const name = harvestInfo(r.harvestId ?? '')?.name ?? item.name
    toast(`${r.firstTime ? `图鉴里点亮了${item.name}！` : `收获了${name}！`}${r.coins ? ` +${r.coins} 金币` : ''}`)
    onClose()
  }

  return (
    <>
      <Modal onClose={onClose}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <PlantArt plant={plant} today={today} size={110} />
        </div>
        <h2 style={{ fontSize: 32 }}>{item.name}</h2>
        <p className="title" style={{ fontSize: 22, color: 'var(--text-soft)', margin: '4px 0 12px' }}>{stageLabel}</p>
        {plant.stage < 3 && (
          <div className="water-dots" aria-label={`已浇水 ${grown} / ${spec.waterToMature} 次`}>
            {Array.from({ length: spec.waterToMature }, (_, i) => (
              <span key={i} className={i < grown ? 'on' : ''}>💧</span>
            ))}
          </div>
        )}
        {thirsty && <p>它有点口渴了，浇点水就会继续长大～</p>}
        {!waterable && !ready && plant.lastWateredDate === today && <p style={{ color: 'var(--text-soft)' }}>今天已经浇过水啦，明天再来吧</p>}
        <div className="modal-actions" style={{ marginTop: 16 }}>
          {ready && <button className="btn btn-primary btn-big" onClick={doHarvest}>🧺 收获</button>}
          {waterable && (
            <button className="btn btn-primary btn-big" onClick={doWater} disabled={balance.drop < 1}>
              💧 浇水{balance.drop < 1 ? '（没有水滴了）' : ''}
            </button>
          )}
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          {plant.stage < 3 && <button className="btn btn-ghost" onClick={() => setDigging(true)}>铲掉</button>}
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
        </div>
      </Modal>
      {digging && (
        <ConfirmDialog
          title={`真的要铲掉${item.name}吗？`}
          message="铲掉后种子不会退回哦"
          confirmText="铲掉"
          onCancel={() => setDigging(false)}
          onConfirm={async () => {
            await act(() => digUp(plant.id))
            setDigging(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
