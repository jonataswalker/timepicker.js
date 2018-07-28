/**
 * @class Drag
 */
export class Drag {
  /**
   * @constructor
   * @param {Function} base Base class.
   */
  constructor(base) {
    let container = base.container.element,
        lastX,
        lastY,
        currentX,
        currentY,
        x,
        y,
        when = {},
        dragging = evt => {
          evt.preventDefault && evt.preventDefault();

          currentX = parseInt(container.style.left, 10) || 0;
          currentY = parseInt(container.style.top, 10) || 0;
          x = currentX + (evt.clientX - lastX);
          y = currentY + (evt.clientY - lastY);

          when.move.call(undefined, {
            target: container,
            x: x,
            y: y,
          });
          lastX = evt.clientX;
          lastY = evt.clientY;
        },
        stopDragging = () => {
          document.removeEventListener('mousemove', dragging, false);
          document.removeEventListener('mouseup', stop, false);
          when.end.call(undefined, {
            target: container,
            x: x,
            y: y,
          });
        },
        start = evt => {
          if (evt.button !== 0) return;

          lastX = evt.clientX;
          lastY = evt.clientY;
          when.start.call({ target: container });
          document.addEventListener('mousemove', dragging, false);
          document.addEventListener('mouseup', stopDragging, false);
        };
    base.container.drag_handle.addEventListener('mousedown', start, false);
    return {
      when: obj => {
        when.start = obj.start;
        when.move = obj.move;
        when.end = obj.end;
      },
    };
  }
}
