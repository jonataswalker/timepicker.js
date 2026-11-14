import path from 'node:path'
import process from 'node:process'
import { createServer } from 'node:http'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'

import { chromium, expect, firefox } from '@playwright/test'

const root = process.cwd()
const workDir = path.join(root, '.pack-check')
const consumer = path.join(workDir, 'consumer')
const site = path.join(consumer, 'site')
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const expectedEvents = { OPEN: 'open', CLOSE: 'close', CHANGE: 'change' }
const expectedInternalEvents = {
    START_FADE_IN: 'start-fade-in',
    END_FADE_IN: 'end-fade-in',
    START_FADE_OUT: 'start-fade-out',
    END_FADE_OUT: 'end-fade-out',
}

const childEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.toLowerCase().startsWith('npm_config_')),
)

function run(command, args, cwd) {
    execFileSync(command, args, { cwd, env: childEnv, stdio: 'inherit' })
}

const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

function serve(directory) {
    const server = createServer((request, response) => {
        const { pathname } = new URL(request.url ?? '/', 'http://localhost')
        const file = path.join(directory, pathname === '/' ? 'index.html' : pathname)

        if (!file.startsWith(directory)) {
            response.writeHead(403).end()
            return
        }

        try {
            const body = readFileSync(file)
            const type = contentTypes[path.extname(file)] ?? 'application/octet-stream'

            response.writeHead(200, { 'Content-Type': type }).end(body)
        } catch {
            response.writeHead(404).end()
        }
    })

    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve(server))
    })
}

async function pickTime(page, inputSelector, [hour, minute]) {
    await page.locator(inputSelector).focus()

    const container = page.locator('body > div', { has: page.locator(`[data-hour="${hour}"]`) })
    const visible = container.filter({ visible: true })

    await expect(visible).toHaveCount(1)
    await expect(visible).toHaveCSS('position', 'absolute')

    await visible.locator(`[data-hour="${hour}"]`).click()
    await visible.locator(`[data-minute="${minute}"]`).click()

    await expect(page.locator(inputSelector)).toHaveValue(`${hour}:${minute}`)
    await expect(visible).toHaveCount(0)
}

async function checkBrowser(browserType, origin) {
    const browser = await browserType.launch()

    try {
        const page = await browser.newPage()
        const errors = []

        page.on('pageerror', (error) => errors.push(error.message))

        await page.goto(`${origin}/index.html`)
        await pickTime(page, '#time', ['10', '30'])
        expect(await page.evaluate(() => globalThis.consumerEvents)).toEqual(['open'])

        await page.goto(`${origin}/script-tag.html`)

        const global = await page.evaluate(() => ({
            defaultIsSelf: TimePicker.default === TimePicker,
            events: TimePicker.Events,
            internalEvents: TimePicker.InternalEvents,
            type: typeof TimePicker,
        }))

        expect(global).toEqual({
            defaultIsSelf: true,
            events: expectedEvents,
            internalEvents: expectedInternalEvents,
            type: 'function',
        })

        await pickTime(page, '#time', ['15', '45'])
        await pickTime(page, '#time-default', ['8', '05'])

        expect(errors).toEqual([])
        console.log(`${browserType.name()}: bundler ESM and script-tag IIFE open and select a time`)
    } finally {
        await browser.close()
    }
}

rmSync(workDir, { force: true, recursive: true })
mkdirSync(workDir, { recursive: true })
run('npm', ['pack', '--ignore-scripts', '--pack-destination', workDir], root)

const tarball = readdirSync(workDir).find((file) => file.endsWith('.tgz'))

if (!tarball) throw new Error('npm pack produced no tarball')

cpSync(path.join(root, 'tests', 'consumer'), consumer, { recursive: true })
run(
    'npm',
    ['install', '--no-audit', '--no-fund', '--no-package-lock', path.join(workDir, tarball)],
    consumer,
)

run(process.execPath, [tsc, '-p', 'tsconfig.json'], consumer)
run(process.execPath, [tsc, '-p', 'tsconfig.nodenext.json'], consumer)
console.log(`types: ${tarball} declarations compile under bundler and nodenext resolution`)

run(
    process.execPath,
    [vite, 'build', '--base', './', '--outDir', 'site', '--logLevel', 'warn'],
    consumer,
)
mkdirSync(path.join(site, 'dist'), { recursive: true })
cpSync(
    path.join(consumer, 'node_modules', 'timepicker.js', 'dist', 'timepicker.iife.js'),
    path.join(site, 'dist', 'timepicker.iife.js'),
)

const server = await serve(site)
const { port } = server.address()
const origin = `http://127.0.0.1:${port}`

try {
    await Promise.all([chromium, firefox].map((browserType) => checkBrowser(browserType, origin)))
} finally {
    server.close()
}
