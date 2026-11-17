import mitt, { type Handler } from 'mitt'

import { handleDrag } from './drag'
import { createStructure } from './html'
import style from './sass/main.module.scss'
import { DEFAULT_OPTIONS } from './constants'
import { fade, getOffset, getWindowSize, isElement, removeClass } from './helpers/dom'
import {
    Events,
    InternalEvents,
    type Picker,
    type Options,
    type EmitterEvents,
    type EmitterClientEvents,
} from './types'

export default class TimePicker {
    container: Picker['container']['element']

    protected emitter = mitt<EmitterEvents & EmitterClientEvents>()

    protected picker: Picker

    private destroyed = false

    private releaseDrag: () => void

    constructor(target: string | Picker['target']['element'], opts: Partial<Options> = {}) {
        let targetElement: Picker['target']['element']

        if (typeof target === 'string') {
            const el = document.querySelector<Picker['target']['element']>(target)

            if (!el) throw new Error(`Couldn't find target (${target}) in DOM`)

            targetElement = el
        } else {
            if (!isElement(target)) throw new Error(`Couldn't find target in DOM`)

            targetElement = target
        }

        const options = { ...DEFAULT_OPTIONS, ...opts }

        this.container = document.createElement('div')

        const container = createStructure(options)
        const offset = getOffset(container)
        const dragElement = container.querySelector(`.${style.header}`)

        if (!(dragElement instanceof HTMLElement)) throw new Error('Picker header not found')

        container.style.display = 'none'
        container.style.visibility = ''

        this.picker = {
            options,
            target: { element: targetElement, offset: getOffset(targetElement) },
            collection: {
                hours: container.querySelectorAll<HTMLAnchorElement>(`.${style['grid-hour']}>a`),
                minutes: container.querySelectorAll<HTMLAnchorElement>(
                    `.${style['grid-minute']}>a`,
                ),
            },
            hour: null,
            minute: null,
            opened: false,
            requestAnimationId: 0,
            closeWhen: { hour: false, minute: false },
            container: {
                element: container,
                dragElement,
                lastX: 0,
                lastY: 0,
                currentX: 0,
                currentY: 0,
                x: 0,
                y: 0,
                size: { width: offset.width, height: offset.height },
            },
        }

        this.releaseDrag = handleDrag(this.picker, {
            start: () => {
                container.classList.add(style.dragging)
            },

            move: (resp) => {
                container.style.left = `${resp.x}px`
                container.style.top = `${resp.y}px`
            },

            end: (resp) => {
                container.classList.remove(style.dragging)

                if (resp.y < 0) container.style.top = '0px'
            },
        })

        this.emitter.on(InternalEvents.START_FADE_IN, (element) => {
            element.style.opacity = '0'
            element.style.display = 'flex'
        })

        this.emitter.on(InternalEvents.START_FADE_OUT, (element) => {
            element.style.opacity = '1'
            element.style.display = 'flex'
        })

        this.emitter.on(InternalEvents.END_FADE_OUT, (element) => {
            element.style.display = 'none'
        })

        this.setDomListeners()
    }

    private get targetEvent() {
        return this.picker.target.element instanceof HTMLInputElement ? 'focus' : 'click'
    }

    private setDomListeners() {
        document.addEventListener('mousedown', this.handleClickOutside)

        this.picker.target.element.addEventListener(this.targetEvent, this.triggerShow)

        this.picker.collection.hours.forEach((anchor) => {
            anchor.addEventListener('click', this.handleAnchorClick)
        })
        this.picker.collection.minutes.forEach((anchor) => {
            anchor.addEventListener('click', this.handleAnchorClick)
        })
    }

    private removeDomListeners() {
        document.removeEventListener('mousedown', this.handleClickOutside)

        this.picker.target.element.removeEventListener(this.targetEvent, this.triggerShow)

        this.picker.collection.hours.forEach((anchor) => {
            anchor.removeEventListener('click', this.handleAnchorClick)
        })
        this.picker.collection.minutes.forEach((anchor) => {
            anchor.removeEventListener('click', this.handleAnchorClick)
        })
    }

    private handleClickOutside = (evt: MouseEvent) => {
        if (!this.picker.opened) return

        const { target } = evt

        if (!(target instanceof Node)) return

        // click inside Picker
        if (this.picker.container.element.contains(target)) return

        const clickingTarget =
            this.picker.target.element === target || this.picker.target.element.contains(target)

        !clickingTarget && this.hide()
    }

    private triggerShow = (evt: FocusEvent | MouseEvent) => {
        if (this.picker.opened) return

        evt.preventDefault()
        this.show()
    }

    private startFade(options: Omit<Parameters<typeof fade>[0], 'emitter' | 'onFrame'>) {
        globalThis.cancelAnimationFrame(this.picker.requestAnimationId)
        fade({
            ...options,
            emitter: this.emitter,
            onFrame: (requestId) => {
                this.picker.requestAnimationId = requestId
            },
        })
    }

    private handleAnchorClick = (evt: MouseEvent) => {
        evt.preventDefault()

        if (this.picker.target.element.matches(':disabled')) return

        const anchor = evt.target

        if (!(anchor instanceof HTMLAnchorElement)) return

        if (Object.hasOwn(anchor.dataset, 'hour')) {
            this.picker.hour = this.getHour(anchor)
            this.picker.closeWhen.hour = true
            removeClass(this.picker.collection.hours, style.selected)
        } else if (Object.hasOwn(anchor.dataset, 'minute')) {
            this.picker.minute = this.getMinute(anchor)
            this.picker.closeWhen.minute = true
            removeClass(this.picker.collection.minutes, style.selected)
        } else {
            throw new Error('Target not found!')
        }

        anchor.classList.add(style.selected)
        this.picker.closeWhen.hour && this.picker.closeWhen.minute && this.hide()

        this.emitter.emit(Events.CHANGE, {
            hour: this.picker.hour,
            minute: this.picker.minute,
            element: this.picker.target.element,
        })
    }

    public show() {
        if (this.destroyed) return

        const { hour, minute, collection } = this.picker
        const containerElement = this.picker.container.element
        const containerSize = this.picker.container.size
        const targetOffset = this.picker.target.offset
        const windowSize = getWindowSize()
        const doesNotFitToTheRight = targetOffset.right + containerSize.width > windowSize.width

        const [left, top] = doesNotFitToTheRight
            ? [`${windowSize.width - (containerSize.width + 20)}px`, `${targetOffset.bottom + 5}px`]
            : [`${targetOffset.right + 5}px`, `${targetOffset.top}px`]

        containerElement.style.left = left
        containerElement.style.top = top

        this.startFade({ element: containerElement })

        removeClass(collection.hours, style.selected)
        removeClass(collection.minutes, style.selected)

        if (hour && minute) {
            let value

            collection.hours.forEach((element) => {
                value = this.getHour(element)

                if (value === hour) {
                    element.classList.add(style.selected)
                }
            })
            collection.minutes.forEach((element) => {
                value = this.getMinute(element)

                if (value === minute) {
                    element.classList.add(style.selected)
                }
            })
        }

        this.picker.opened = true
        this.picker.closeWhen.hour = false
        this.picker.closeWhen.minute = false

        // client events
        this.emitter.emit(Events.OPEN, { element: this.picker.target.element })
    }

    public hide() {
        if (this.destroyed) return

        this.picker.opened = false
        this.startFade({ element: this.picker.container.element, time: 800, action: 'out' })

        // client events
        this.emitter.emit(Events.CLOSE, { element: this.picker.container.element })
    }

    public on<Key extends keyof EmitterClientEvents>(
        type: Key,
        handler: Handler<EmitterClientEvents[Key]>,
    ) {
        if (this.destroyed) return

        this.emitter.on(type, (event) => {
            if (!this.destroyed) handler(event)
        })
    }

    public destroy() {
        if (this.destroyed) return

        this.destroyed = true
        this.picker.opened = false
        globalThis.cancelAnimationFrame(this.picker.requestAnimationId)
        this.removeDomListeners()
        this.releaseDrag()
        this.emitter.all.clear()
        this.picker.container.element.remove()
    }

    private getHour(element: HTMLAnchorElement) {
        return element.dataset.hour ?? ''
    }

    private getMinute(element: HTMLAnchorElement) {
        return element.dataset.minute ?? ''
    }
}

export * from './types'
