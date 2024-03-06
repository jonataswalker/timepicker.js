import type TimePicker from '../main'
import { type EmitterEvents, Events, type Picker } from '../types'

export function isElement(object: string | HTMLElement | null) {
    if (!object) return false

    // DOM, Level2
    if ('HTMLElement' in window) {
        return Boolean(object) && object instanceof HTMLElement
    }

    // Older browsers
    return Boolean(object) && typeof object === 'object' && object.nodeType === 1 && Boolean(object.nodeName)
}

export function getOffset(element: HTMLElement) {
    const rect = element.getBoundingClientRect()
    const { documentElement } = document
    const left = rect.left + window.scrollX - documentElement.clientLeft
    const top = rect.top + window.scrollY - documentElement.clientTop
    const width = element.offsetWidth
    const height = element.offsetHeight
    const right = left + width
    const bottom = top + height

    return { width, height, top, bottom, right, left }
}

export function createElement(node: string | [tag: string, opts: { id?: string, classname: string }], html: string) {
    let element

    if (Array.isArray(node)) {
        element = document.createElement(node[0])
        if (node[1].id) element.id = node[1].id

        if (node[1].classname) element.className = node[1].classname
    }
    else {
        element = document.createElement(node)
    }

    element.innerHTML = html
    const frag = document.createDocumentFragment()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (element.childNodes[0]) frag.append(element.childNodes[0])

    element.append(frag)

    return element
}

export function getMaxZIndex() {
    return Array.from(document.querySelectorAll('body *'), el =>
        Number.parseFloat(window.getComputedStyle(el).zIndex),
    )
        .filter(zIndex => !Number.isNaN(zIndex))
        .reduce((accumulator, current) => (current > accumulator ? current : accumulator), 0)
}

export function getWindowSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    }
}

export function fade(
    { emitter, element, time = 300, action = 'in' }: { emitter: TimePicker['emitter'], element: Picker['container']['element'], time?: number, action?: string },
) {
    let start: number
    let requestId

    const [evtStart, evtEnd]
      = action === 'in'
          ? [Events.START_FADE_IN, Events.END_FADE_IN]
          : [Events.START_FADE_OUT, Events.END_FADE_OUT]

    const tick = (timestamp: number) => {
        if (!start) {
            emitter.emit(evtStart as keyof EmitterEvents, element)
            start = timestamp
        }

        const opacity
        = action === 'in'
            ? Number(element.style.opacity) + (timestamp - start) / time
            : Number(element.style.opacity) - (timestamp - start) / time

        const finished = action === 'in' ? opacity >= 1 : opacity <= 0

        element.style.opacity = String(opacity)

        if (finished) {
            emitter.emit(evtEnd as keyof EmitterEvents, element)
        }
        else {
            requestId = window.requestAnimationFrame(tick)
        }
    }

    requestId = window.requestAnimationFrame(tick)

    return requestId
}

export function removeClass(elements: NodeListOf<HTMLElement>, className: string) {
    elements.forEach((each) => {
        each.classList.remove(className)
    })
}
