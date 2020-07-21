/**
 * @class Drag
 */
export class Drag {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    const container = base.container.element;

    let lastX;
    let lastY;
    let currentX;
    let currentY;
    let x;
    let y;

    const when = {};

    const dragging = (evt) => {
      evt.preventDefault && evt.preventDefault();

      currentX = Number.parseInt(container.style.left, 10) || 0;
      currentY = Number.parseInt(container.style.top, 10) || 0;
      x = currentX + (evt.clientX - lastX);
      y = currentY + (evt.clientY - lastY);

      when.move.call(undefined, {
        target: container,
        x,
        y,
      });
      lastX = evt.clientX;
      lastY = evt.clientY;
    };
    const stopDragging = () => {
      document.removeEventListener('mousemove', dragging, false);
      document.removeEventListener('mouseup', stop, false);
      when.end.call(undefined, {
        target: container,
        x,
        y,
      });
    };

    const start = (evt) => {
      if (evt.button !== 0) return;

      lastX = evt.clientX;
      lastY = evt.clientY;
      when.start.call({ target: container });
      document.addEventListener('mousemove', dragging, false);
      document.addEventListener('mouseup', stopDragging, false);
    };

    base.container.drag_handle.addEventListener('mousedown', start, false);

    return {
      when: (object) => {
        when.start = object.start;
        when.move = object.move;
        when.end = object.end;
      },
    };
  }
}
