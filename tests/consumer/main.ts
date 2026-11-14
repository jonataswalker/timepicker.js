import TimePicker, { Events, type EmitterClientEvents } from 'timepicker.js'

declare global {
    var consumerEvents: string[]
}

const input = document.querySelector<HTMLInputElement>('#time')

if (!input) throw new Error('Missing #time input')

const picker = new TimePicker(input, { theme: 'blue', lang: 'en' })

globalThis.consumerEvents = []

picker.on(Events.OPEN, () => {
    globalThis.consumerEvents.push('open')
})
picker.on(Events.CHANGE, (evt: EmitterClientEvents['change']) => {
    input.value = `${evt.hour}:${evt.minute}`
})
