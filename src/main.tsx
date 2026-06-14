import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './index.css'
import { App } from './App'

// Always begin the journey at the top on (re)load — stop the browser from
// restoring the previous scroll position so a refresh resets the whole thing.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" → framer-motion honours the OS setting, converting
        transform/layout animations to instant for users who ask for less motion. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
