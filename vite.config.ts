import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import bannerPlugin from 'vite-plugin-banner'
import { default as cssInjectedByJsPlugin } from 'vite-plugin-css-injected-by-js'

type Pkg = { name: string, version: string, homepage: string }

const { name, version, homepage } = JSON.parse(readFileSync('./package.json', 'utf8')) as Pkg
const banner = `
  /*!
  * ${name} - v${version}
  * ${homepage}
  * Built: ${new Date().toUTCString()}
  */
`

const target = 'es2022'

export default defineConfig(({ command }) => {
    if (command === 'serve') return { target }

    return {
        build: {
            target,
            lib: {
                entry: './src/main.ts',
                name: 'TimePicker',
                fileName: 'timepicker',
                formats: ['es', 'umd', 'iife'],
            },
        },
        plugins: [
            bannerPlugin(banner),
            cssInjectedByJsPlugin(),
            dts({ rollupTypes: true }),
        ],
        define: {
            __APP_VERSION__: JSON.stringify(version),
        },
    }
})
