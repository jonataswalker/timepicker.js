import { LANG } from './constants'
import type { Picker } from './types'
import style from './sass/main.module.scss'
import { createElement, getMaxZIndex } from './helpers/dom'

const themesMap = {
    'dark': style.grey,
    'red': style.red,
    'pink': style.pink,
    'purple': style.purple,
    'deep-purple': style['deep-purple'],
    'indigo': style.indigo,
    'blue': style.blue,
    'light-blue': style['light-blue'],
    'cyan': style.cyan,
    'teal': style.teal,
    'green': style.green,
    'light-green': style['light-green'],
    'lime': style.lime,
    'yellow': style.yellow,
    'amber': style.amber,
    'orange': style.orange,
    'deep-orange': style['deep-orange'],
    'brown': style.brown,
    'blue-grey': style['blue-grey'],
}

const createHours = () => {
    let structure = `<div class="${style.grid} ${style['grid-hour']} ${style['hour-width']}">`

    Array.from({ length: 24 }, (_, i) => i).forEach((hour) => {
        structure += `<a data-hour="${hour}">${hour}</a>`
    })

    structure += '</div>'

    return structure
}
const createMinutes = () => {
    let structure = `<div class="${style.grid} ${style['grid-minute']} ${style['minute-width']}">`

    Array.from({ length: 12 }, (_, i) => i * 5).forEach((each) => {
        const minute = String(each).padStart(2, '0')

        structure += `<a data-minute="${minute}">${minute}</a>`
    })

    structure += '</div>'

    return structure
}

export function createStructure(picker: Picker) {
    const structure = `
        <div class="${style['grid-container']} ${style.header}">
            <div class="${style['hour-width']}">${LANG[picker.options.lang].hour}</div>
            <div class="${style['minute-width']}">${LANG[picker.options.lang].minute}</div>
        </div>
        <div class="${style['grid-container']} ${style['grid-container-without-header']}">
            ${createHours()}
            ${createMinutes()}
        </div>
    `

    const classname = [style['timepicker-container'], themesMap[picker.options.theme]].join(' ')
    const container = createElement(['div', { classname }], structure)

    container.style.zIndex = String(getMaxZIndex() + 10)
    container.style.visibility = 'hidden'
    document.body.append(container)

    return container
}
