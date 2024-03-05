import { expect, type Locator, type Page } from '@playwright/test'

export class PlaywrightDevPage {
    readonly page: Page
    readonly inputFocus: Locator
    readonly triggerElement: Locator
    readonly triggerHeading: Locator
    readonly triggerInputElement: Locator
    readonly pickerContainerFromFocus: Locator
    readonly pickerContainerFromTrigger: Locator

    constructor(page: Page) {
        this.page = page
        this.inputFocus = page.locator('#focus-trigger')
        this.triggerElement = page.locator('#click-trigger')
        this.triggerHeading = page.getByRole('heading', { name: 'Triggering:' })
        this.triggerInputElement = page.locator('#click-trigger-input')
        this.pickerContainerFromFocus = page.locator('div.focus-trigger-container-class')
        this.pickerContainerFromTrigger = page.locator('div.click-trigger-container-class')
    }

    async clickOutside() {
        await this.triggerHeading.click()
    }

    async setTime(hour: string, minute: string) {
        const hourAnchor = this.pickerContainerFromTrigger.locator(`[data-hour="${hour}"]`)
        const minuteAnchor = this.pickerContainerFromTrigger.locator(`[data-minute="${minute}"]`)

        await hourAnchor.click()
        await minuteAnchor.click()

        await expect(hourAnchor).toHaveClass(/selected/)
        await expect(minuteAnchor).toHaveClass(/selected/)
    }
}
