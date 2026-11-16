import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { splashArtDataUrl } from './src/theme/splashArt.js'

function inlineSplash(): Plugin {
  const art = new URL('./src/theme/splash-art.svg', import.meta.url)
  const stylesheet = new URL('./src/theme/splash.css', import.meta.url)

  return {
    name: 'inline-splash',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return {
          html: html.replace('%%SPLASH_ART%%', splashArtDataUrl(readFileSync(art, 'utf8'))),
          tags: [{ tag: 'style', children: readFileSync(stylesheet, 'utf8'), injectTo: 'head-prepend' }],
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [inlineSplash(), react(), tailwindcss()],
})
