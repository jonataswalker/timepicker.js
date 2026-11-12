import { test, expect } from '@playwright/test'

import { PlaywrightDevPage } from './page-dev'

let devPage: PlaywrightDevPage

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000')

    devPage = new PlaywrightDevPage(page)
})

test.describe('Events', () => {
    test('Listen for `open` event', async ({ page }) => {
        let eventsCalled = await page.evaluate(() => window.testingPurposes.eventsCalled)

        expect(eventsCalled.length).toBe(0)

        await devPage.triggerElement.click()

        eventsCalled = await page.evaluate(() => window.testingPurposes.eventsCalled)

        expect(eventsCalled.includes('open')).toBe(true)
    })
    test('Listen for `close` event', async ({ page }) => {
        await devPage.triggerElement.click()
        await devPage.clickOutside()

        const eventsCalled = await page.evaluate(() => window.testingPurposes.eventsCalled)

        expect(eventsCalled.includes('close')).toBe(true)
    })
    test('Ignores time selection while the input is disabled', async () => {
        const input = devPage.inputFocus

        await input.fill('12:00')

        const hour = devPage.pickerContainerFromFocus.locator('[data-hour="15"]')

        await expect(hour).toBeVisible()

        await input.evaluate(element => (element as HTMLInputElement).disabled = true)
        await hour.click()
        await expect(input).toHaveValue('12:00')

        await input.evaluate(element => (element as HTMLInputElement).disabled = false)
        await hour.click()
        await expect(input).toHaveValue('15:00')
    })
    test('Listen for `change` event', async ({ page }) => {
        const chosenPayload = { h: '10', m: '30' }

        await devPage.triggerElement.click()
        await devPage.setTime(chosenPayload.h, chosenPayload.m)

        const { eventsCalled, chosen } = await page.evaluate(() => window.testingPurposes)

        expect(eventsCalled.includes('change')).toBe(true)
        expect(chosen.hour).toBe(chosenPayload.h)
        expect(chosen.minute).toBe(chosenPayload.m)
    })
})
