import type { Picker, PickerDragHandler } from './types'

export function handleDrag(picker: Picker, handlers: PickerDragHandler) {
    let { element, dragElement, lastX, lastY, currentX, currentY, x, y } = picker.container

    const dragging = (evt: MouseEvent) => {
        evt.preventDefault()

        currentX = Number.parseInt(element.style.left, 10) || 0
        currentY = Number.parseInt(element.style.top, 10) || 0
        x = currentX + (evt.clientX - lastX)
        y = currentY + (evt.clientY - lastY)

        handlers.move({ x, y })
        lastX = evt.clientX
        lastY = evt.clientY
    }
    const stopDragging = () => {
        document.removeEventListener('mousemove', dragging, false)
        document.removeEventListener('mouseup', stopDragging, false)
        handlers.end({ x, y })
    }
    const startDragging = (evt: MouseEvent) => {
        if (evt.button !== 0) return

        lastX = evt.clientX
        lastY = evt.clientY

        handlers.start()
        document.addEventListener('mousemove', dragging, false)
        document.addEventListener('mouseup', stopDragging, false)
    }

    dragElement.addEventListener('mousedown', startDragging, false)

    return () => {
        dragElement.removeEventListener('mousedown', startDragging, false)
        document.removeEventListener('mousemove', dragging, false)
        document.removeEventListener('mouseup', stopDragging, false)
    }
}
