import { useEffect, useState } from 'react'
import { formatReadTime, pinyinImageUrl, type PinyinCard } from '../../data/pinyinCards'
import { Modal } from '../../ui/Modal'
import './pinyin.css'

export interface ReadResult { readTimes: number; readBestSec: number }

/**
 * 每日拼读：看老师的拼读卡读，每读一遍点一下计时（开始 / 读完了），
 * 读了几遍、最快一遍多久随作业交给爸爸妈妈。点图片可以放大。
 */
export function PinyinCardSheet({ card, onFinish, onClose }: { card: PinyinCard; onFinish: (r: ReadResult) => Promise<unknown>; onClose: () => void }) {
  const [laps, setLaps] = useState<number[]>([])
  const [startAt, setStartAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    if (startAt === null) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [startAt])

  const running = startAt !== null
  const elapsed = running ? Math.max(0, Math.floor((now - startAt) / 1000)) : 0
  const best = laps.length ? Math.min(...laps) : 0

  const toggle = () => {
    if (running) {
      setLaps([...laps, Math.max(1, Math.round((Date.now() - startAt) / 1000))])
      setStartAt(null)
    } else {
      setStartAt(Date.now())
      setNow(Date.now())
    }
  }

  return (
    <Modal wide onClose={onClose}>
      <div className="pinyin">
        <h2 className="modal-title">🔤 每日拼读 · {card.title}</h2>
        <button className={`pinyin-img${zoom ? ' zoom' : ''}`} onClick={() => setZoom(!zoom)} aria-label={zoom ? '缩小图片' : '放大图片'}>
          <img src={pinyinImageUrl(card)} alt={`拼读卡：${card.title}`} />
        </button>
        <p className="hint pinyin-hint">点图片可以{zoom ? '缩小' : '放大'}</p>

        <div className="pinyin-bar">
          <div className="pinyin-clock">
            <span className="pinyin-round">第 {laps.length + 1} 遍</span>
            <span className="num pinyin-time" aria-live="off">{formatReadTime(elapsed)}</span>
          </div>
          <button className={`btn btn-big pinyin-go ${running ? 'btn-ghost stop' : 'btn-primary'}`} onClick={toggle}>
            {running ? '读完了 ⏹' : laps.length ? '再读一遍 ▶' : '开始读 ▶'}
          </button>
        </div>

        {laps.length > 0 && (
          <ol className="pinyin-laps">
            {laps.map((s, i) => (
              <li key={i} className={s === best ? 'best' : ''}>
                第 {i + 1} 遍 <b className="num">{formatReadTime(s)}</b>{s === best && laps.length > 1 && ' ⭐ 最快'}
              </li>
            ))}
          </ol>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost btn-big" onClick={onClose}>先关掉</button>
          <button
            className="btn btn-primary btn-big"
            disabled={!laps.length || running}
            onClick={async () => { await onFinish({ readTimes: laps.length, readBestSec: best }); onClose() }}
          >
            {laps.length ? `读了 ${laps.length} 遍，交作业 ✓` : '读完一遍再交'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
