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
