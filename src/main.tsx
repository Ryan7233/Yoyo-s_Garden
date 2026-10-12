import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/zcool-kuaile/400.css'
import './ui/global.css'
import { App } from './app/App'
import { initPwa } from './app/pwa'
import { installAudioUnlock } from './ui/sfx'
import { installKeyboardInset } from './ui/keyboard'

initPwa()
installAudioUnlock()
installKeyboardInset()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
