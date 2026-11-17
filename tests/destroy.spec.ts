import { test, expect, type Page } from '@playwright/test'

async function setUpPickers(page: Page, count: number) {
    await page.evaluate((pickerCount) => {
        const attached = new Set<string>()
        const ids = new WeakMap<object, number>()
        let nextId = 0
        const idOf = (value: object) => {
            if (!ids.has(value)) ids.set(value, (nextId += 1))

            return ids.get(value)
        }
        const keyOf = (
            target: EventTarget,
            type: string,
            listener: EventListenerOrEventListenerObject | null,
        ) => `${idOf(target)}:${type}:${listener ? idOf(listener) : 0}`
        const nativeAdd = Reflect.get(EventTarget.prototype, 'addEventListener')
        const nativeRemove = Reflect.get(EventTarget.prototype, 'removeEventListener')

        EventTarget.prototype.addEventListener = function add(type, listener, options) {
            attached.add(keyOf(this, type, listener))
            Reflect.apply(nativeAdd, this, [type, listener, options])
        }
        EventTarget.prototype.removeEventListener = function remove(type, listener, options) {
            attached.delete(keyOf(this, type, listener))
            Reflect.apply(nativeRemove, this, [type, listener, options])
        }

        const events: string[] = []
        const pickers = Array.from({ length: pickerCount }, (_, index) => {
            const input = document.createElement('input')

            input.id = `destroy-${index}`
            document.body.append(input)

            const picker = new window.testingPurposes.TimePicker(`#destroy-${index}`)

            picker.on('open', () => events.push(`open:${index}`))
            picker.on('close', () => events.push(`close:${index}`))
            picker.on('change', ({ hour, minute }) =>
                events.push(`change:${index}:${hour}:${minute}`),
            )

            return picker
        })

        window.destroyHarness = { pickers, events, listenersAttached: () => attached.size }
    }, count)
}

function collectPageErrors(page: Page) {
    const errors: string[] = []

    page.on('pageerror', (error) => errors.push(error.message))

    return errors
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000')
})

test.describe('destroy()', () => {
    test('removes the container and every listener the picker added', async ({ page }) => {
        await setUpPickers(page, 1)

        const before = await page.evaluate(() => window.destroyHarness.listenersAttached())
        const after = await page.evaluate(() => {
            const [picker] = window.destroyHarness.pickers

            // @ts-expect-error destroy() lands in the next commit
            picker.destroy()

            return {
                listeners: window.destroyHarness.listenersAttached(),
                // @ts-expect-error the picker state is protected; tests read it
                connected: picker.picker.container.element.isConnected,
            }
        })

        expect(before).toBeGreaterThan(0)
        expect(after).toEqual({ listeners: 0, connected: false })
    })

    test('a destroyed picker ignores the target, document clicks, anchors and handlers', async ({
        page,
    }) => {
        const errors = collectPageErrors(page)

        await setUpPickers(page, 1)
        await page.evaluate(() => {
            const [picker] = window.destroyHarness.pickers

            // @ts-expect-error destroy() lands in the next commit
            picker.destroy()
            picker.on('open', () => window.destroyHarness.events.push('late-open'))
            picker.on('change', () => window.destroyHarness.events.push('late-change'))
        })

        await page.locator('#destroy-0').focus()
        await page.locator('#destroy-0').click()
        await page.mouse.click(5, 5)

        const result = await page.evaluate(() => {
            const [picker] = window.destroyHarness.pickers
            // @ts-expect-error the picker state is protected; tests read it
            const { collection, container } = picker.picker

            collection.hours[3].click()
            collection.minutes[2].click()
            picker.show()
            picker.hide()

            return {
                events: window.destroyHarness.events,
                connected: container.element.isConnected,
                value: (document.getElementById('destroy-0') as HTMLInputElement).value,
            }
        })

        expect(result).toEqual({ events: [], connected: false, value: '' })
        expect(errors).toEqual([])
    })

    test('a second destroy() is a no-op', async ({ page }) => {
        const errors = collectPageErrors(page)

        await setUpPickers(page, 1)
        await page.evaluate(() => {
            const [picker] = window.destroyHarness.pickers

            // @ts-expect-error destroy() lands in the next commit
            picker.destroy()
            // @ts-expect-error destroy() lands in the next commit
            picker.destroy()
        })

        expect(await page.evaluate(() => window.destroyHarness.listenersAttached())).toBe(0)
        expect(errors).toEqual([])
    })

    test('destroying one picker leaves another working', async ({ page }) => {
        await setUpPickers(page, 2)
        await page.evaluate(() => {
            // @ts-expect-error destroy() lands in the next commit
            window.destroyHarness.pickers[0].destroy()
        })

        await page.locator('#destroy-1').focus()

        const visible = await page.evaluate(() => {
            // @ts-expect-error the picker state is protected; tests read it
            const { element } = window.destroyHarness.pickers[1].picker.container

            return element.isConnected && element.style.display === 'flex'
        })

        expect(await page.evaluate(() => window.destroyHarness.events)).toEqual(['open:1'])
        expect(visible).toBe(true)
    })

    test('destroy() during a drag removes the document drag listeners', async ({ page }) => {
        await setUpPickers(page, 1)
        await page.locator('#destroy-0').focus()

        const result = await page.evaluate(() => {
            const [picker] = window.destroyHarness.pickers
            // @ts-expect-error the picker state is protected; tests read it
            const { dragElement, element } = picker.picker.container

            dragElement.dispatchEvent(
                new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 10, clientY: 10 }),
            )

            const whileDragging = window.destroyHarness.listenersAttached()

            // @ts-expect-error destroy() lands in the next commit
            picker.destroy()

            const { left } = element.style

            document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 200 }))
            document.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 200 }))

            return {
                whileDragging,
                afterDestroy: window.destroyHarness.listenersAttached(),
                moved: element.style.left !== left,
            }
        })

        expect(result.whileDragging).toBeGreaterThan(0)
        expect(result.afterDestroy).toBe(0)
        expect(result.moved).toBe(false)
    })

    test('destroy() from inside open, change and close handlers', async ({ page }) => {
        const errors = collectPageErrors(page)

        await setUpPickers(page, 3)
        await page.evaluate(() => {
            const [onOpen, onChange, onClose] = window.destroyHarness.pickers

            // @ts-expect-error destroy() lands in the next commit
            onOpen.on('open', () => onOpen.destroy())
            // @ts-expect-error destroy() lands in the next commit
            onChange.on('change', () => onChange.destroy())
            // @ts-expect-error destroy() lands in the next commit
            onClose.on('close', () => onClose.destroy())
        })

        await page.locator('#destroy-0').focus()
        await page.locator('#destroy-1').focus()
        await page.evaluate(() => {
            // @ts-expect-error the picker state is protected; tests read it
            window.destroyHarness.pickers[1].picker.collection.hours[3].click()
        })
        await page.locator('#destroy-2').focus()
        await page.evaluate(() => {
            // @ts-expect-error the picker state is protected; tests read it
            const { collection } = window.destroyHarness.pickers[2].picker

            collection.hours[3].click()
            collection.minutes[2].click()
        })

        const result = await page.evaluate(() => ({
            listeners: window.destroyHarness.listenersAttached(),
            connected: window.destroyHarness.pickers.map(
                // @ts-expect-error the picker state is protected; tests read it
                (picker) => picker.picker.container.element.isConnected,
            ),
        }))

        expect(result).toEqual({ listeners: 0, connected: [false, false, false] })
        expect(errors).toEqual([])
    })
})
