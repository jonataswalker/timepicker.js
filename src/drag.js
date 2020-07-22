export function handleDrag(picker) {
  // eslint-disable-next-line prefer-const
  let { element, dragElement, lastX, lastY, currentX, currentY, x, y } = picker.container;

  const when = {};
  const dragging = (evt) => {
    evt.preventDefault();

    currentX = Number.parseInt(element.style.left, 10) || 0;
    currentY = Number.parseInt(element.style.top, 10) || 0;
    x = currentX + (evt.clientX - lastX);
    y = currentY + (evt.clientY - lastY);

    when.move.call(undefined, { target: element, x, y });
    lastX = evt.clientX;
    lastY = evt.clientY;
  };
  const stopDragging = () => {
    document.removeEventListener('mousemove', dragging, false);
    document.removeEventListener('mouseup', stopDragging, false);
    when.end.call(undefined, { target: element, x, y });
  };
  const startDragging = (evt) => {
    if (evt.button !== 0) return;

    lastX = evt.clientX;
    lastY = evt.clientY;

    when.start.call({ target: element });
    document.addEventListener('mousemove', dragging, false);
    document.addEventListener('mouseup', stopDragging, false);
  };

  dragElement.addEventListener('mousedown', startDragging, false);

  return {
    when: (object) => {
      when.start = object.start;
      when.move = object.move;
      when.end = object.end;
    },
  };
}
