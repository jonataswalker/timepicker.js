import { test, expect, type Page } from '@playwright/test'

const HOST_ID = 'dynamic-host'

async function createHost(page: Page) {
    await page.evaluate((hostId) => {
        const host = document.createElement('div')

        host.id = hostId
        document.body.append(host)
    }, HOST_ID)
}

async function opened(page: Page) {
    return page.evaluate(() => window.testingPurposes.eventsCalled)
}

async function bindPicker(page: Page, inputSelector: string, containerClass: string) {
    await page.evaluate(
        ([selector, className]) => {
            const picker = new window.testingPurposes.TimePicker(selector)

            // @ts-expect-error the container is protected; tests tag it to find it
            picker.picker.container.element.classList.add(className)
            picker.on('open', () => {
                window.testingPurposes.eventsCalled.push(`open:${className}`)
            })
        },
        [inputSelector, containerClass] as const,
    )
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000')
    await createHost(page)
})

test.describe('Inputs created with innerHTML (#52)', () => {
    test('Opens for an input inserted before the picker is created', async ({ page }) => {
        await page.evaluate((hostId) => {
            document.getElementById(hostId)!.innerHTML =
                '<input readonly class="time-input" type="text" id="time" placeholder="Time">'
        }, HOST_ID)
        await bindPicker(page, '#time', 'first-container')

        await page.locator('#time').focus()

        await expect(page.locator('div.first-container')).toBeVisible()
    })

    test('A picker stays bound to the element it was created for', async ({ page }) => {
        await page.evaluate((hostId) => {
            document.getElementById(hostId)!.innerHTML =
                '<input readonly class="time-input" type="text" id="time" placeholder="Time">'
        }, HOST_ID)
        await bindPicker(page, '#time', 'first-container')

        await page.evaluate((hostId) => {
            document.getElementById(hostId)!.innerHTML +=
                '<input readonly class="time-input" type="text" id="time-2" placeholder="Time">'
        }, HOST_ID)

        await page.locator('#time').focus()

        expect(await opened(page)).not.toContain('open:first-container')
        await expect(page.locator('div.first-container')).toBeHidden()

        await page.locator('#time').blur()
        await bindPicker(page, '#time', 'rebound-container')
        await page.locator('#time').focus()

        expect(await opened(page)).toContain('open:rebound-container')
        await expect(page.locator('div.rebound-container')).toBeVisible()
    })

    test('insertAdjacentHTML keeps the existing input bound', async ({ page }) => {
        await page.evaluate((hostId) => {
            document.getElementById(hostId)!.innerHTML =
                '<input readonly class="time-input" type="text" id="time" placeholder="Time">'
        }, HOST_ID)
        await bindPicker(page, '#time', 'first-container')

        await page.evaluate((hostId) => {
            document
                .getElementById(hostId)!
                .insertAdjacentHTML(
                    'beforeend',
                    '<input readonly class="time-input" type="text" id="time-2" placeholder="Time">',
                )
        }, HOST_ID)

        await page.locator('#time').focus()

        await expect(page.locator('div.first-container')).toBeVisible()
    })
})
