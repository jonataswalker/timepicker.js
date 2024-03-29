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
    container!: Picker['container']['element']

    protected emitter = mitt<EmitterEvents & EmitterClientEvents>()

    protected picker!: Picker

    constructor(target: string | Picker['target']['element'], opts: Partial<Options> = {}) {
        let targetElement: Picker['target']['element']

        if (typeof target === 'string') {
            const el = document.querySelector<Picker['target']['element']>(target)

            if (!el) throw new Error(`Couldn't find target (${target}) in DOM`)

            targetElement = el
        }
        else {
            if (!isElement(target)) throw new Error(`Couldn't find target in DOM`)

            targetElement = target
        }

        const options = Object.assign(DEFAULT_OPTIONS, opts)

        this.container = document.createElement('div')

        this.picker = {
            options,
            target: { element: targetElement, offset: getOffset(targetElement) },
            // this will cache DOM <a> hours (and minutes) array among others
            // @ts-expect-error wait for init
            collection: { hours: [], minutes: [] },
            // @ts-expect-error wait for init
            hour: null,
            // @ts-expect-error wait for init
            minute: null,
            opened: false,
            requestAnimationId: 0,
            closeWhen: { hour: false, minute: false },

            container: {
                // @ts-expect-error wait for init
                element: null,
                // @ts-expect-error wait for init
                dragElement: null,
                // @ts-expect-error wait for init
                lastX: null,
                // @ts-expect-error wait for init
                lastY: null,
                // @ts-expect-error wait for init
                currentX: null,
                // @ts-expect-error wait for init
                currentY: null,
                // @ts-expect-error wait for init
                x: null,
                // @ts-expect-error wait for init
                y: null,
                // @ts-expect-error wait for init
                size: { width: null, height: null },
            },
        }

        const container = createStructure(this.picker)
        const offset = getOffset(container)

        container.style.display = 'none'
        container.style.visibility = ''
        this.picker.container.element = container
        this.picker.container.size.width = offset.width
        this.picker.container.size.height = offset.height
        this.picker.container.dragElement = container.querySelector(`.${style.header}`)!
        this.picker.collection.hours = container.querySelectorAll<HTMLAnchorElement>(`.${style['grid-hour']}>a`)
        this.picker.collection.minutes = container.querySelectorAll<HTMLAnchorElement>(`.${style['grid-minute']}>a`)

        const drag = handleDrag(this.picker)

        drag.when({
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

    private setDomListeners() {
        document.addEventListener('mousedown', this.handleClickOutside)

        this.picker.target.element.addEventListener(
            this.picker.target.element instanceof HTMLInputElement
                ? 'focus'
                : 'click',
            this.triggerShow,
        )

        this.picker.collection.hours.forEach((anchor) => {
            anchor.addEventListener('click', this.handleAnchorClick)
        })
        this.picker.collection.minutes.forEach((anchor) => {
            anchor.addEventListener('click', this.handleAnchorClick)
        })
    }

    private handleClickOutside = (evt: MouseEvent) => {
        if (!this.picker.opened) return

        const target = evt.target as HTMLElement

        // click inside Picker
        if (this.picker.container.element.contains(target)) return

        const clickingTarget = this.picker.target.element === target || this.picker.target.element.contains(target)

        !clickingTarget && this.hide()
    }

    private triggerShow = (evt: FocusEvent | MouseEvent) => {
        if (this.picker.opened) return

        evt.preventDefault()
        window.cancelAnimationFrame(this.picker.requestAnimationId)
        this.show()
    }

    private handleAnchorClick = (evt: MouseEvent) => {
        evt.preventDefault()

        const anchor = evt.target as HTMLAnchorElement

        if (Object.hasOwn(anchor.dataset, 'hour')) {
            this.picker.hour = this.getHour(anchor)
            this.picker.closeWhen.hour = true
            removeClass(this.picker.collection.hours, style.selected)
        }
        else if (Object.hasOwn(anchor.dataset, 'minute')) {
            this.picker.minute = this.getMinute(anchor)
            this.picker.closeWhen.minute = true
            removeClass(this.picker.collection.minutes, style.selected)
        }
        else {
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

        this.picker.requestAnimationId = fade({ emitter: this.emitter, element: containerElement })

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
        this.picker.opened = false
        this.picker.requestAnimationId = fade({
            emitter: this.emitter,
            element: this.picker.container.element,
            time: 800,
            action: 'out',
        })

        // client events
        this.emitter.emit(Events.CLOSE, { element: this.picker.container.element })
    }

    public on<Key extends keyof EmitterClientEvents>(type: Key, handler: Handler<EmitterClientEvents[Key]>) {
        this.emitter.on(type, handler)
    }

    private getHour(element: HTMLAnchorElement) {
        return element.dataset.hour ?? ''
    }

    private getMinute(element: HTMLAnchorElement) {
        return element.dataset.minute ?? ''
    }
}

export * from './types'
