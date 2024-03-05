import type { Picker, PickerDragHandler } from './types'

export function handleDrag(picker: Picker) {
    let { element, dragElement, lastX, lastY, currentX, currentY, x, y } = picker.container

    // @ts-expect-error will be implemented
    const when: PickerDragHandler = {}
    const dragging = (evt: MouseEvent) => {
        evt.preventDefault()

        currentX = Number.parseInt(element.style.left, 10) || 0
        currentY = Number.parseInt(element.style.top, 10) || 0
        x = currentX + (evt.clientX - lastX)
        y = currentY + (evt.clientY - lastY)

        when.move.call(null, { target: element, x, y })
        lastX = evt.clientX
        lastY = evt.clientY
    }
    const stopDragging = () => {
        document.removeEventListener('mousemove', dragging, false)
        document.removeEventListener('mouseup', stopDragging, false)
        when.end.call(null, { target: element, x, y })
    }
    const startDragging = (evt: MouseEvent) => {
        if (evt.button !== 0) return

        lastX = evt.clientX
        lastY = evt.clientY

        when.start.call({ target: element })
        document.addEventListener('mousemove', dragging, false)
        document.addEventListener('mouseup', stopDragging, false)
    }

    dragElement.addEventListener('mousedown', startDragging, false)

    return {
        when: (object: PickerDragHandler) => {
            when.start = object.start
            when.move = object.move
            when.end = object.end
        },
    }
}
