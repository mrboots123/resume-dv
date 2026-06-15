// Build-time prerender: run the already-built SPA in a headless browser, let it
// render fully, then snapshot the live DOM back into dist/index.html. This makes
// the whole résumé crawlable by bots that don't execute JS (Bing, social/LLM
// crawlers) and lets Google index on the first pass instead of the deferred
// JS-render pass.
//
// We snapshot a real browser (rather than react-dom/server SSG) on purpose:
// Leaflet touches `window` at render time, so true SSR would need component
// rewrites. A headless snapshot runs the app exactly as a user's browser would.
//
// This step is NON-FATAL: if the browser can't launch (e.g. Chromium missing in
// CI), we log a warning and keep the vite-built index.html, which still carries
// the full <head> meta/OG/JSON-LD. A prerender hiccup must never break a deploy.
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const OUT = resolve('dist/index.html')

let server
let browser
try {
  server = await preview({ preview: { port: 4178 } })
  const url = server.resolvedUrls.local[0]
  console.log('[prerender] serving build at', url)

  browser = await puppeteer.launch({
    headless: true,
    // CI sandboxes (Netlify/containers) require these to launch Chromium.
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 1600 })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 })

  // Wait until React has actually populated the root with the timeline content.
  await page.waitForSelector('main article, main section', { timeout: 30_000 })

  // Scroll through the page so every IntersectionObserver/scroll-driven element
  // mounts and settles, then return to the top for a clean above-the-fold snapshot.
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await sleep(120)
    }
    window.scrollTo(0, 0)
    await sleep(200)
  })

  const html = await page.content()
  await writeFile(OUT, html, 'utf8')
  console.log('[prerender] wrote fully-rendered HTML →', OUT, `(${html.length} bytes)`)
} catch (err) {
  console.warn(
    '\n[prerender] SKIPPED — keeping non-prerendered index.html (head meta/OG/JSON-LD intact).\n' +
      '            Reason: ' + (err?.message || err) + '\n',
  )
} finally {
  await browser?.close().catch(() => {})
  await server?.httpServer?.close?.()
}

// Always succeed: the prerender is an enhancement, not a build gate.
process.exit(0)
