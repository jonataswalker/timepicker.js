import { test, expect, type Page } from '@playwright/test'

import type { Options } from '../src/types.ts'

type PickerSnapshot = {
    options: Options
    classes: string[]
    labels: string[]
}

type IsolationResult = {
    first: PickerSnapshot
    second: PickerSnapshot
    pageDefault: PickerSnapshot
    sharesOptionsObject: boolean
}

async function createTwoPickers(
    page: Page,
    firstOptions: Partial<Options>,
    secondOptions?: Partial<Options>,
) {
    return page.evaluate(
        ([optionsForFirst, optionsForSecond]) => {
            const { TimePicker, picker: pageDefaultPicker } = window.testingPurposes

            for (const id of ['isolation-first', 'isolation-second']) {
                const input = document.createElement('input')

                input.id = id
                document.body.append(input)
            }

            const snapshot = (instance: InstanceType<typeof TimePicker>) => {
                // @ts-expect-error the picker state is protected; tests read it to compare instances
                const { options, container } = instance.picker
                const header = container.element.firstElementChild

                return {
                    options: { ...options },
                    classes: [...container.element.classList],
                    labels: [...(header?.children ?? [])].map((label) => label.textContent.trim()),
                }
            }

            const first = new TimePicker('#isolation-first', optionsForFirst)
            const second = new TimePicker('#isolation-second', optionsForSecond)
            const firstSnapshot = snapshot(first)
            const secondSnapshot = snapshot(second)

            return {
                first: firstSnapshot,
                second: secondSnapshot,
                pageDefault: snapshot(pageDefaultPicker),
                // @ts-expect-error the picker state is protected; tests read it to compare instances
                sharesOptionsObject: first.picker.options === second.picker.options,
            } satisfies IsolationResult
        },
        [firstOptions, secondOptions] as const,
    )
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000')
})

test.describe('Each picker gets its own options', () => {
    test('A picker created without options gets the defaults, not an earlier picker’s', async ({
        page,
    }) => {
        const { first, second, pageDefault } = await createTwoPickers(page, {
            theme: 'red',
            lang: 'pt',
        })

        expect(first.options).toEqual({ theme: 'red', lang: 'pt' })
        expect(second.options).toEqual({ theme: 'dark', lang: 'en' })
        expect(second.labels).toEqual(['Hour', 'Minute'])
        expect(pageDefault.classes).toEqual(expect.arrayContaining(second.classes))
        expect(second.classes).not.toEqual(first.classes)
        expect(pageDefault.options).toEqual({ theme: 'dark', lang: 'en' })
    })

    test('A later picker with other options leaves the earlier picker unchanged', async ({
        page,
    }) => {
        const { first, second, sharesOptionsObject } = await createTwoPickers(
            page,
            { theme: 'red', lang: 'pt' },
            { theme: 'blue', lang: 'de' },
        )

        expect(first.options).toEqual({ theme: 'red', lang: 'pt' })
        expect(first.labels).toEqual(['Hora', 'Minuto'])
        expect(second.options).toEqual({ theme: 'blue', lang: 'de' })
        expect(second.labels).toEqual(['Stunde', 'Minute'])
        expect(second.classes).not.toEqual(first.classes)
        expect(sharesOptionsObject).toBe(false)
    })
})
