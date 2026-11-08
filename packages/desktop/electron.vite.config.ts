import { resolve } from 'node:path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

/**
 * Icons are consumed straight from the icon libraries (`~icons/<set>/<name>`), never copied
 * into the source. These two knobs are the only place their look is tuned, so every icon
 * in a set shares one weight.
 */
const SOLAR_STROKE_WIDTH = '2'
const BRAND_OUTLINE_WIDTH = '0.5'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        transform(svg, collection) {
          if (collection === 'solar') return svg.replaceAll('stroke-width="1.5"', `stroke-width="${SOLAR_STROKE_WIDTH}"`)
          if (collection === 'simple-icons') {
            return svg.replace('<svg', `<svg stroke="currentColor" stroke-width="${BRAND_OUTLINE_WIDTH}" stroke-linejoin="round"`)
          }
          return svg
        },
      }),
    ],
  },
})
