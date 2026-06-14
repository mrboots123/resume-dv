import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './index.css'
import { App } from './App'

// Always begin the journey at the top on (re)load — stop the browser from
// restoring the previous scroll position so a refresh resets the whole thing.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

// A note for whoever opens DevTools to see how this was built — usually the
// most technical person evaluating me. Make it worth their click.
console.log(
  '%cYou opened the console. 👋%c\nBuilt with React + TypeScript + Leaflet — single source of truth, scroll-driven, 60fps.\nIf you got this far, we should talk: %cvazquez.diego59@gmail.com',
  'color:#0ea5e9;font-size:16px;font-weight:700',
  'color:#94a3b8;font-size:12px;line-height:1.6',
  'color:#0ea5e9;font-size:12px;font-weight:600',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" → framer-motion honours the OS setting, converting
        transform/layout animations to instant for users who ask for less motion. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
