import { isNumeric } from './mix';

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String|Array<String>} classname Class or array of classes.
 * For example: 'class1 class2' or ['class1', 'class2']
 * @param {Number|undefined} timeout Timeout to remove a class.
 */
export function addClass(element, classname, timeout) {
  if (Array.isArray(element)) {
    element.forEach((each) => addClass(each, classname));

    return;
  }

  const array = Array.isArray(classname) ? classname : classname.split(/\s+/);

  let i = array.length;

  while (i--) {
    if (!hasClass(element, array[i])) {
      _addClass(element, array[i], timeout);
    }
  }
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String|Array<String>} classname Class or array of classes.
 * For example: 'class1 class2' or ['class1', 'class2']
 * @param {Number|undefined} timeout Timeout to add a class.
 */
export function removeClass(element, classname, timeout) {
  if (Array.isArray(element)) {
    element.forEach((each) => removeClass(each, classname, timeout));

    return;
  }

  const array = Array.isArray(classname) ? classname : classname.split(/\s+/);

  let i = array.length;

  while (i--) {
    if (hasClass(element, array[i])) {
      _removeClass(element, array[i], timeout);
    }
  }
}

/**
 * @param {Element} element DOM node.
 * @param {String} classname Classname.
 * @return {Boolean}
 */
export function hasClass(element, c) {
  // use native if available
  return element.classList ? element.classList.contains(c) : classRegex(c).test(element.className);
}

/**
 * @param {Element|Array<Element>} element DOM node or array of nodes.
 * @param {String} classname Classe.
 */
export function toggleClass(element, classname) {
  if (Array.isArray(element)) {
    element.forEach((each) => toggleClass(each, classname));

    return;
  }

  // use native if available
  if (element.classList) {
    element.classList.toggle(classname);
  } else {
    hasClass(element, classname) ? _removeClass(element, classname) : _addClass(element, classname);
  }
}

/**
 * Abstraction to querySelectorAll for increased
 * performance and greater usability
 * @param {String} selector
 * @param {Element} context (optional)
 * @param {Boolean} find_all (optional)
 * @return (find_all) {Element} : {Array}
 */
export function find(selector, context = window.document, find_all) {
  const simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/;

  const periodRe = /\./g;

  const { slice } = Array.prototype;

  let matches = [];

  // Redirect call to the more performant function
  // if it's a simple selector and return an array
  // for easier usage
  if (simpleRe.test(selector)) {
    switch (selector[0]) {
      case '#':
        matches = [$(selector.slice(1))];

        break;
      case '.':
        matches = slice.call(
          context.getElementsByClassName(selector.slice(1).replace(periodRe, ' '))
        );

        break;

      default:
        matches = slice.call(context.getElementsByTagName(selector));
    }
  } else {
    // If not a simple selector, query the DOM as usual
    // and return an array for easier usage
    matches = slice.call(context.querySelectorAll(selector));
  }

  return find_all ? matches : matches[0];
}

export function toType(object) {
  if (object === window && object.document && object.location) return 'window';

  if (object === document) return 'htmldocument';

  if (typeof object === 'string') return 'string';

  if (isElement(object)) return 'element';
}

export function evaluate(el) {
  let element;

  switch (toType(el)) {
    case 'window':
    case 'htmldocument':
    case 'element':
      element = el;

      break;
    case 'string':
      const t = el[0] === '#' || el[0] === '.' ? el : `#${el}`;

      element = find(t);

      break;

    default:
      console.warn('Unknown type');
  }

  return element;
}

export function $(id) {
  id = id[0] === '#' ? id.slice(1, 1 + id.length) : id;

  return document.getElementById(id);
}

export function isElement(object) {
  // DOM, Level2
  if ('HTMLElement' in window) {
    return !!object && object instanceof HTMLElement;
  }

  // Older browsers
  return !!object && typeof object === 'object' && object.nodeType === 1 && !!object.nodeName;
}

export function getAllChildren(node, tag) {
  return [].slice.call(node.getElementsByTagName(tag));
}

export function removeAllChildren(node) {
  while (node.firstChild) node.firstChild.remove();
}

export function removeAll(collection) {
  let node;

  while ((node = collection[0])) node.remove();
}

export function getChildren(node, tag) {
  return [].filter.call(node.childNodes, (el) =>
    tag ? el.nodeType === 1 && el.tagName.toLowerCase() === tag : el.nodeType === 1
  );
}

export function template(html, row) {
  return html.replace(/{ *([\w-]+) *}/g, (htm, key) => {
    const value = row[key] === undefined ? '' : row[key];

    return htmlEscape(value);
  });
}

export function htmlEscape(string) {
  return String(string)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function createElement(node, html) {
  let element;

  if (Array.isArray(node)) {
    element = document.createElement(node[0]);

    if (node[1].id) element.id = node[1].id;

    if (node[1].classname) element.className = node[1].classname;

    if (node[1].attr) {
      const { attr } = node[1];

      if (Array.isArray(attr)) {
        let i = -1;

        while (++i < attr.length) {
          element.setAttribute(attr[i].name, attr[i].value);
        }
      } else {
        element.setAttribute(attr.name, attr.value);
      }
    }
  } else {
    element = document.createElement(node);
  }

  element.innerHTML = html;

  const frag = document.createDocumentFragment();

  while (element.childNodes[0]) frag.append(element.childNodes[0]);

  element.append(frag);

  return element;
}

export function getScroll() {
  return [
    window.pageXOffset ||
      (document.documentElement && document.documentElement.scrollLeft) ||
      document.body.scrollLeft,
    window.pageYOffset ||
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop,
  ];
}

export function getViewportSize() {
  return {
    w: window.innerWidth || document.documentElement.clientWidth,
    h: window.innerHeight || document.documentElement.clientHeight,
  };
}

export function getDocumentHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

export function getWindowSize() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,

    height:
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  };
}

export function getMaxZIndex(zIndex, max = 0, i = -1) {
  const all = find('*', document, true);
  const length_ = all.length;

  while (++i < length_) {
    zIndex = Number.parseInt(window.getComputedStyle(all[i]).zIndex, 10);
    max = zIndex ? Math.max(max, zIndex) : max;
  }

  return max;
}

export function offset(element) {
  const rect = element.getBoundingClientRect();
  const { documentElement } = document;

  return {
    left: rect.left + window.pageXOffset - documentElement.clientLeft,
    top: rect.top + window.pageYOffset - documentElement.clientTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

function classRegex(classname) {
  return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`);
}

function _addClass(el, klass, timeout) {
  // use native if available
  if (el.classList) {
    el.classList.add(klass);
  } else {
    el.className = `${el.className} ${klass}`.trim();
  }

  if (timeout && isNumeric(timeout)) {
    window.setTimeout(() => _removeClass(el, klass), timeout);
  }
}

function _removeClass(el, klass, timeout) {
  if (el.classList) {
    el.classList.remove(klass);
  } else {
    el.className = el.className.replace(classRegex(klass), ' ').trim();
  }

  if (timeout && isNumeric(timeout)) {
    window.setTimeout(() => _addClass(el, klass), timeout);
  }
}
