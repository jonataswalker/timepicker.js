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

const IIFE_MODE = 'iife'

export default defineConfig(({ command, mode }) => {
    if (command === 'serve') return { target, optimizeDeps: { entries: ['index.html'] } }

    const iife = mode === IIFE_MODE

    return {
        build: {
            target,
            emptyOutDir: !iife,
            lib: iife
                ? {
                      entry: './src/iife.ts',
                      name: 'TimePicker',
                      fileName: 'timepicker',
                      formats: ['iife'],
                  }
                : {
                      entry: './src/main.ts',
                      fileName: 'timepicker',
                      formats: ['es'],
                  },
            rolldownOptions: { output: { exports: iife ? 'default' : 'named' } },
        },
        plugins: [
            bannerPlugin(banner),
            cssInjectedByJsPlugin(),
            !iife
                && dts({
                    bundleTypes: {
                        invokeOptions: { typescriptCompilerFolder: typescript6Folder },
                    },
                    include: ['src/**/*.ts'],
                    exclude: ['src/**/*.spec.ts', 'src/iife.ts'],
                    outDirs: 'dist',
                }),
        ],
        define: {
            __APP_VERSION__: JSON.stringify(version),
        },
    }
})
