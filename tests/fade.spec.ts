import { test, expect, type Page } from '@playwright/test'

async function createPicker(page: Page) {
    await page.evaluate(() => {
        const input = document.createElement('input')

        input.id = 'fade-target'
        document.body.append(input)
        window.destroyHarness = {
            pickers: [new window.testingPurposes.TimePicker('#fade-target')],
            events: [],
            listenersAttached: () => 0,
        }
    })
}

async function waitFrames(page: Page, count: number) {
    await page.evaluate(
        async (frameCount) =>
            new Promise<void>((resolve) => {
                let seen = 0
                const step = () => {
                    seen += 1

                    if (seen >= frameCount) resolve()
                    else globalThis.requestAnimationFrame(step)
                }

                globalThis.requestAnimationFrame(step)
            }),
        count,
    )
}

async function containerState(page: Page) {
    return page.evaluate(() => {
        // @ts-expect-error the picker state is protected; tests read it
        const { element } = window.destroyHarness.pickers[0].picker.container

        return { display: element.style.display, opacity: Number(element.style.opacity) }
    })
}

async function call(page: Page, method: 'show' | 'hide' | 'destroy') {
    await page.evaluate((name) => {
        window.destroyHarness.pickers[0][name]()
    }, method)
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000')
    await createPicker(page)
})

test.describe('Fade', () => {
    test('no fade-in frame runs after destroy() mid-fade', async ({ page }) => {
        await call(page, 'show')
        await waitFrames(page, 4)
        await call(page, 'destroy')

        const atDestroy = await containerState(page)

        await waitFrames(page, 10)

        expect(atDestroy.opacity).toBeLessThan(1)
        expect(await containerState(page)).toEqual(atDestroy)
    })

    test('no fade-out frame runs after destroy() mid-fade', async ({ page }) => {
        await call(page, 'show')
        await expect
            .poll(async () => (await containerState(page)).opacity)
            .toBeGreaterThanOrEqual(1)
        await call(page, 'hide')
        await waitFrames(page, 4)
        await call(page, 'destroy')

        const atDestroy = await containerState(page)

        await waitFrames(page, 10)

        expect(atDestroy.opacity).toBeGreaterThan(0)
        expect(await containerState(page)).toEqual(atDestroy)
    })

    test('show() during a fade-out ends shown', async ({ page }) => {
        await call(page, 'show')
        await expect
            .poll(async () => (await containerState(page)).opacity)
            .toBeGreaterThanOrEqual(1)
        await call(page, 'hide')
        await waitFrames(page, 4)
        await call(page, 'show')
        await page.waitForTimeout(1200)

        const state = await containerState(page)

        expect(state.display).toBe('flex')
        expect(state.opacity).toBeGreaterThanOrEqual(1)
    })

    test('hide() during a fade-in ends hidden', async ({ page }) => {
        await call(page, 'show')
        await waitFrames(page, 4)
        await call(page, 'hide')
        await page.waitForTimeout(1200)

        const state = await containerState(page)

        expect(state.display).toBe('none')
        expect(state.opacity).toBeLessThanOrEqual(0)
    })
})
