import { test, expect } from '@playwright/test'

import { PlaywrightDevPage } from './page-dev'

let devPage: PlaywrightDevPage

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000')

    devPage = new PlaywrightDevPage(page)
})

test.describe('Basic Usage', () => {
    test('Open on focus', async () => {
        await devPage.inputFocus.focus()

        await expect(devPage.pickerContainerFromFocus).toBeVisible()
    })
    test('Open on click', async () => {
        await devPage.triggerElement.click()

        await expect(devPage.pickerContainerFromTrigger).toBeVisible()
    })
    test('Show programatically', async ({ page }) => {
        await expect(devPage.pickerContainerFromTrigger).not.toBeVisible()
        await page.evaluate(() => {
            window.testingPurposes.picker.show()
        })

        await expect(devPage.pickerContainerFromTrigger).toBeVisible()
    })
    test('Hide programatically', async ({ page }) => {
        await devPage.triggerElement.click()

        await page.evaluate(() => {
            window.testingPurposes.picker.hide()
        })

        await expect(devPage.pickerContainerFromTrigger).not.toBeVisible()
    })
    test('Hide when click outside', async () => {
        await devPage.triggerElement.click()
        await expect(devPage.pickerContainerFromTrigger).toBeVisible()

        await devPage.clickOutside()
        await expect(devPage.pickerContainerFromTrigger).not.toBeVisible()
    })
    test('Set time properly', async () => {
        const chosen = { h: '10', m: '30' }

        await devPage.triggerElement.click()
        await devPage.setTime(chosen.h, chosen.m)

        expect(await devPage.triggerInputElement.inputValue()).toBe(Object.values(chosen).join(':'))
        await expect(devPage.pickerContainerFromTrigger).not.toBeVisible()

        chosen.h = '23'
        chosen.m = '55'

        await devPage.triggerElement.click()
        await devPage.setTime(chosen.h, chosen.m)

        expect(await devPage.triggerInputElement.inputValue()).toBe(Object.values(chosen).join(':'))
        await expect(devPage.pickerContainerFromTrigger).not.toBeVisible()
    })
})
