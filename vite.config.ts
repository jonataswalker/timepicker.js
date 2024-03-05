import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import bannerPlugin from 'vite-plugin-banner'
// eslint-disable-next-line import/default, import/no-named-as-default, import/no-named-as-default-member
import typescript from '@rollup/plugin-typescript'
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
            typescript({ tsconfig: 'tsconfig.build.json' }),
        ],
        define: {
            __APP_VERSION__: JSON.stringify(version),
        },
    }
})
