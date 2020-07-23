import { assert, fade } from './helpers/mix.js';
import {
  isElement,
  getOffset,
  addClass,
  removeClass,
  getWindowSize,
  getHour,
  getMinute,
  hasClass,
} from './helpers/dom.js';
import { DEFAULT_OPTIONS, FOCUSABLE, CLICKABLE, EVENT_TYPE } from './constants.js';
import { createStructure } from './html.js';
import { handleDrag } from './drag.js';
import mitt from './emitter.js';
import style from './sass/main.scss';

/**
 * @param {String|Element} target String or DOM node
 * @param {Object|undefined} initOptions Options
 */
export default function (target, initOptions) {
  const targetElement = isElement(target) ? target : document.querySelector(target);

  assert(isElement(targetElement), "Couldn't find target in DOM");

  const emitter = mitt();
  const options = Object.assign(DEFAULT_OPTIONS, initOptions);
  const picker = {
    options,
    target: { element: targetElement, offset: getOffset(targetElement) },
    // this will cache DOM <a> hours (and minutes) array among others
    collection: { hours: [], minutes: [] },
    hour: null,
    minute: null,
    requestAnimationId: null,
    opened: false,
    closeWhen: { hour: false, minute: false },

    container: {
      element: null,
      dragElement: null,
      lastX: null,
      lastY: null,
      currentX: null,
      currentY: null,
      x: null,
      y: null,
      size: { width: null, height: null },
    },
  };

  function initialize() {
    const container = createStructure(picker);
    const offset = getOffset(container);

    container.style.display = 'none';
    container.style.visibility = '';
    picker.container.element = container;
    picker.container.size.width = offset.width;
    picker.container.size.height = offset.height;
    picker.container.dragElement = container.querySelector(`.${style.dragTarget}`);
    picker.collection.hours = container.querySelectorAll(`.${style.hourAnchor}`);
    picker.collection.minutes = container.querySelectorAll(`.${style.minuteAnchor}`);

    const drag = handleDrag(picker);

    drag.when({
      start: () => addClass(container, style.dragging),

      move: (resp) => {
        container.style.left = `${resp.x}px`;
        container.style.top = `${resp.y}px`;
      },

      end: (resp) => {
        removeClass(container, style.dragging);

        if (resp.y < 0) container.style.top = 0;
      },
    });

    setListeners();
  }

  function triggerShow(evt) {
    if (picker.opened) return;

    evt.preventDefault();
    window.cancelAnimationFrame(picker.requestAnimationId);
    show();
  }

  function show() {
    const { hour, minute, collection } = picker;
    const containerElement = picker.container.element;
    const containerSize = picker.container.size;
    const targetOffset = picker.target.offset;
    const windowSize = getWindowSize();
    const doesNotFitToTheRight = targetOffset.right + containerSize.width > windowSize.width;

    const [left, top] = doesNotFitToTheRight
      ? [`${windowSize.width - (containerSize.width + 20)}px`, `${targetOffset.bottom + 5}px`]
      : [`${targetOffset.right + 5}px`, `${targetOffset.top}px`];

    containerElement.style.left = left;
    containerElement.style.top = top;

    picker.requestAnimationId = fade({ emitter, element: containerElement });

    removeClass(collection.hours, style.selected);
    removeClass(collection.minutes, style.selected);

    if (hour && minute) {
      let value;

      collection.hours.forEach((element) => {
        value = getHour(element);

        if (value === hour) {
          addClass(element, style.selected);
        }
      });
      collection.minutes.forEach((element) => {
        value = getMinute(element);

        if (value === minute) {
          addClass(element, style.selected);
        }
      });
    }

    // one-time fire
    document.addEventListener(
      'mousedown',
      {
        handleEvent(evt) {
          // click inside Picker
          if (containerElement.contains(evt.target)) return;

          const clickingTarget = picker.target.element === evt.target;

          if (!clickingTarget) {
            picker.opened && hide();
            document.removeEventListener(evt.type, this, false);
          }
        },
      },
      false
    );

    picker.opened = true;
    picker.closeWhen.hour = false;
    picker.closeWhen.minute = false;

    // client events
    emitter.emit(EVENT_TYPE.open, { element: picker.target.element });
  }

  function hide() {
    picker.opened = false;
    picker.requestAnimationId = fade({
      emitter,
      element: picker.container.element,
      time: 800,
      action: 'out',
    });

    // client events
    emitter.emit(EVENT_TYPE.close, { element: picker.container.element });
  }

  function setTarget(newTarget) {
    const newTargetElement = isElement(newTarget) ? newTarget : document.querySelector(newTarget);

    assert(isElement(newTargetElement), "Couldn't find target in DOM");

    picker.target.element.removeEventListener('focus', triggerShow, true);
    picker.target.element.removeEventListener('click', triggerShow, true);
    picker.hour = null;
    picker.minute = null;

    picker.target.element = newTargetElement;
    picker.target.offset = getOffset(newTargetElement);
    setListeners();
  }

  function setListeners() {
    emitter.on(EVENT_TYPE.startFadeIn, (object) => {
      object.target.style.opacity = 0;
      object.target.style.display = 'block';
    });

    emitter.on(EVENT_TYPE.startFadeOut, (object) => {
      object.target.style.opacity = 1;
      object.target.style.display = 'block';
    });

    emitter.on(EVENT_TYPE.endFadeOut, (object) => {
      object.target.style.display = 'none';
    });

    if (FOCUSABLE.test(picker.target.element.nodeName)) {
      picker.target.element.addEventListener('focus', triggerShow, true);
    } else if (CLICKABLE.test(picker.target.element.nodeName)) {
      picker.target.element.addEventListener('click', triggerShow, true);
    }

    picker.collection.hours.forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick);
    });
    picker.collection.minutes.forEach((anchor) => {
      anchor.addEventListener('click', handleAnchorClick);
    });
  }

  function handleAnchorClick(evt) {
    evt.preventDefault();

    const anchor = evt.target;

    if (hasClass(anchor, style.hourAnchor)) {
      picker.hour = getHour(anchor);
      picker.closeWhen.hour = true;
      removeClass(picker.collection.hours, style.selected);
    } else {
      picker.minute = getMinute(anchor);
      picker.closeWhen.minute = true;
      removeClass(picker.collection.minutes, style.selected);
    }

    addClass(anchor, style.selected);
    picker.closeWhen.hour && picker.closeWhen.minute && hide();

    emitter.emit(EVENT_TYPE.change, {
      element: picker.target.element,
      hour: picker.hour,
      minute: picker.minute,
    });
  }

  return { options, show, hide, initialize, picker, emitter, setTarget };
}
