import { EVENT_TYPE } from '../constants';

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') throw new Error(message);

    throw message; // Fallback
  }
}

export function now() {
  // Polyfill for window.performance.now()
  // @license http://opensource.org/licenses/MIT
  // copyright Paul Irish 2015
  // https://gist.github.com/paulirish/5438650
  if ('performance' in window === false) {
    window.performance = {};
  }

  Date.now =
    Date.now ||
    function () {
      // thanks IE8
      return new Date().getTime();
    };

  if ('now' in window.performance === false) {
    let nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }

    window.performance.now = () => Date.now() - nowOffset;
  }

  return window.performance.now();
}

export function randomId(prefix) {
  const id = now().toString(36);

  return prefix ? prefix + id : id;
}

export function isNumeric(string) {
  return /^\d+$/u.test(string);
}

export function isEmpty(string) {
  return !string || string.length === 0;
}

export function emptyArray(array) {
  while (array.length) array.pop();
}

export function anyMatchInArray(source, target) {
  return source.some((each) => target.includes(each));
}

export function everyMatchInArray(array1, array2) {
  return array2.every((each) => array1.includes(each));
}

/**
 * @param {Function} emitter
 * @param {Element} element
 * @param {Object} config
 */
export function fade({ emitter, element, time = 300, action = 'in' }) {
  let start = null;
  let requestId;

  const [evtStart, evtEnd] =
    action === 'in'
      ? [EVENT_TYPE.startFadeIn, EVENT_TYPE.endFadeIn]
      : [EVENT_TYPE.startFadeOut, EVENT_TYPE.endFadeOut];

  const tick = (timestamp) => {
    if (!start) {
      emitter.emit(evtStart, { target: element });
      start = timestamp;
    }

    const opacity =
      action === 'in'
        ? Number(element.style.opacity) + (timestamp - start) / time
        : Number(element.style.opacity) - (timestamp - start) / time;

    const finished = action === 'in' ? opacity >= 1 : opacity <= 0;

    element.style.opacity = opacity;

    if (finished) {
      emitter.emit(evtEnd, { target: element });
    } else {
      requestId = window.requestAnimationFrame(tick);
    }
  };

  requestId = window.requestAnimationFrame(tick);

  return requestId;
}
