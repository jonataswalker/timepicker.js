import { EVENT_TYPE } from '../constants';

/**
 * Overwrites obj1's values with obj2's and adds
 * obj2's if non existent in obj1
 * @returns obj3 a new object based on obj1 and obj2
 */
export function mergeOptions(obj1, obj2) {
  let obj3 = {};
  for (let attr1 in obj1) obj3[attr1] = obj1[attr1];
  for (let attr2 in obj2) obj3[attr2] = obj2[attr2];
  return obj3;
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

export function isNumeric(str) {
  return /^\d+$/.test(str);
}

export function isEmpty(str) {
  return !str || 0 === str.length;
}

export function emptyArray(array) {
  while (array.length) array.pop();
}

export function anyMatchInArray(source, target) {
  return source.some(each => target.indexOf(each) >= 0);
}

export function everyMatchInArray(arr1, arr2) {
  return arr2.every(each => arr1.indexOf(each) >= 0);
}

export function anyItemHasValue(obj, has = false) {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (!isEmpty(obj[key])) has = true;
  });
  return has;
}

/**
 * Pub/Sub
 */
export function pubSub() {
  let topics = {};
  let hOP = topics.hasOwnProperty;
  return {
    subscribe: (topic, listener) => {
      // Create the topic's object if not yet created
      if (!hOP.call(topics, topic)) topics[topic] = [];
      // Add the listener to queue
      let index = topics[topic].push(listener) - 1;
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
      topics[topic].forEach(item => item(info !== undefined ? info : {}));
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
  let start = null,
      finished = false;
  let request_id;

  let event_start =
    action === 'in' ? EVENT_TYPE.start_fade_in : EVENT_TYPE.start_fade_out;

  let event_end =
    action === 'in' ? EVENT_TYPE.end_fade_in : EVENT_TYPE.end_fade_out;

  const tick = timestamp => {
    if (!start) {
      publisher.publish(event_start, { target: element });
      start = timestamp;
    }

    if (action === 'in') {
      opacity = +element.style.opacity + (timestamp - start) / time;
      finished = opacity >= 1;
    } else {
      opacity = +element.style.opacity - (timestamp - start) / time;
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
