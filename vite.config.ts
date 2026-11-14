import path from 'node:path'
import { createRequire } from 'node:module'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import bannerPlugin from 'vite-plugin-banner'
import { default as cssInjectedByJsPlugin } from 'vite-plugin-css-injected-by-js'

import packageJson from './package.json' with { type: 'json' }

const { name, version, homepage } = packageJson
const banner = `
  /*!
  * ${name} - v${version}
  * ${homepage}
  * Built: ${new Date().toUTCString()}
  */
`

const typescript6Require = createRequire(
    createRequire(import.meta.url).resolve('@typescript/typescript6'),
)
const typescript6Folder = path.dirname(typescript6Require.resolve('@typescript/old/package.json'))

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
                formats: ['es', 'iife'],
            },
            rolldownOptions: { output: { exports: 'named' } },
        },
        plugins: [
            bannerPlugin(banner),
            cssInjectedByJsPlugin(),
            dts({
                bundleTypes: {
                    invokeOptions: { typescriptCompilerFolder: typescript6Folder },
                },
                include: ['src/**/*.ts'],
                exclude: ['src/**/*.spec.ts'],
                outDirs: 'dist',
            }),
        ],
        define: {
            __APP_VERSION__: JSON.stringify(version),
        },
    }
})
