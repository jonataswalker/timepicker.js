import { EVENT_TYPE } from '../constants';

/**
 * Overwrites obj1's values with obj2's and adds
 * obj2's if non existent in obj1
 * @returns obj3 a new object based on obj1 and obj2
 */
export function mergeOptions(object1, object2) {
  const object3 = {};

  for (const attribute1 in object1) object3[attribute1] = object1[attribute1];

  for (const attribute2 in object2) object3[attribute2] = object2[attribute2];

  return object3;
}

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
  return /^\d+$/.test(string);
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

export function anyItemHasValue(object, has = false) {
  const keys = Object.keys(object);

  keys.forEach((key) => {
    if (!isEmpty(object[key])) has = true;
  });

  return has;
}

/**
 * Pub/Sub
 */
export function pubSub() {
  const topics = {};
  const hOP = topics.hasOwnProperty;

  return {
    subscribe: (topic, listener) => {
      // Create the topic's object if not yet created
      if (!hOP.call(topics, topic)) topics[topic] = [];

      // Add the listener to queue
      const index = topics[topic].push(listener) - 1;

      // Provide handle back for removal of topic
      return {
        remove: () => delete topics[topic][index],
      };
    },

    publish: (topic, info) => {
      // If the topic doesn't exist, or there's no listeners
      // in queue, just leave
      if (!hOP.call(topics, topic)) return;

      // Cycle through topics queue, fire!
      topics[topic].forEach((item) => item(info !== undefined ? info : {}));
    },
  };
}

/**
 * @param {Function} publisher instanceof pubSub().
 * @param {Element} element DOM node.
 * @param {String} action 'in' or 'out'.
 * @param {Number|undefined} time ms.
 */
export function fade(publisher, element, time = 300, action = 'in') {
  let opacity;
  let start = null;
  let finished = false;
  let request_id;

  const event_start = action === 'in' ? EVENT_TYPE.start_fade_in : EVENT_TYPE.start_fade_out;

  const event_end = action === 'in' ? EVENT_TYPE.end_fade_in : EVENT_TYPE.end_fade_out;

  const tick = (timestamp) => {
    if (!start) {
      publisher.publish(event_start, { target: element });
      start = timestamp;
    }

    if (action === 'in') {
      opacity = Number(element.style.opacity) + (timestamp - start) / time;
      finished = opacity >= 1;
    } else {
      opacity = Number(element.style.opacity) - (timestamp - start) / time;
      finished = opacity <= 0;
    }

    element.style.opacity = opacity;

    if (finished) {
      publisher.publish(event_end, { target: element });
    } else {
      request_id = window.requestAnimationFrame(tick);
    }
  };

  request_id = window.requestAnimationFrame(tick);

  return request_id;
}
