const { join } = require('node:path')

// Keep Chromium inside node_modules so Netlify's node_modules cache carries it
// across builds. The default location (~/.cache/puppeteer) is wiped on every
// cached build, which leaves the prerender step with no browser to launch.
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
}
