// iPad 弹出键盘时，可见区域变小。把被键盘盖住的高度写进 CSS 变量 --kb，
// 弹窗、家长模式和首次引导用它把内容往上让，输入框不会被挡住。
export function installKeyboardInset() {
  const vv = window.visualViewport
  if (!vv) return
  const update = () => {
    const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
    document.documentElement.style.setProperty('--kb', `${Math.round(kb)}px`)
  }
  vv.addEventListener('resize', update)
  vv.addEventListener('scroll', update)
  update()
}
