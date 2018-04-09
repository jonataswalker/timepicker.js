/*!
 * timepicker.js - v2.3.0
 * A lightweight, customizable, TimePicker. Zero dependencies.
 * https://github.com/jonataswalker/timepicker.js
 * Built: Mon Apr 09 2018 19:57:37 GMT-0300 (-03)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.TimePicker = factory());
}(this, (function () { 'use strict';

  var namespace = "_jw-tpk";
  var width = "260px";
  var height = "140px";
  var container_id = "-container-id";
  var container_class = "-container";
  var header_class = "-header";
  var body_class = "-body";
  var hour_class = "-hour";
  var minute_class = "-minute";
  var selected_class = "-selected";
  var dragging_class = "-dragging";
  var attr = {"hour":"data-hour","minute":"data-minute"};
  var ids = {"hour_list":"hour_list_id","minute_list":"minute_list_id"};
  var vars = {
  	namespace: namespace,
  	width: width,
  	height: height,
  	container_id: container_id,
  	container_class: container_class,
  	header_class: header_class,
  	body_class: body_class,
  	hour_class: hour_class,
  	minute_class: minute_class,
  	selected_class: selected_class,
  	dragging_class: dragging_class,
  	attr: attr,
  	ids: ids
  };

  var _VARS = /*#__PURE__*/Object.freeze({
    namespace: namespace,
    width: width,
    height: height,
    container_id: container_id,
    container_class: container_class,
    header_class: header_class,
    body_class: body_class,
    hour_class: hour_class,
    minute_class: minute_class,
    selected_class: selected_class,
    dragging_class: dragging_class,
    attr: attr,
    ids: ids,
    default: vars
  });

  const EVENT_TYPE = {
    open: 'open',
    close: 'close',
    change: 'change',
    start_fade_in: 'start-fade-in',
    end_fade_in: 'end-fade-in',
    start_fade_out: 'start-fade-out',
    end_fade_out: 'end-fade-out'
  };

  const DEFAULT_OPTIONS = {
    lang: 'en',
    theme: 'dark'
  };

  const FOCUSABLE = /^(?:input|select|textarea|button|object)$/i;

  const CLICKABLE = /^(?:a|area)$/i;

  const LANG = {
    en: {
      hour: 'Hour',
      minute: 'Minute'
    },
    pt: {
      hour: 'Hora',
      minute: 'Minuto'
    }
  };

  const VARS = _VARS;

  /**
   * DOM Elements classname
   */
  const CLASSNAME = {
    container : namespace + container_class,
    header    : namespace + header_class,
    body      : namespace + body_class,
    hour      : namespace + hour_class,
    minute    : namespace + minute_class,
    selected  : namespace + selected_class,
    dragging  : namespace + dragging_class
  };

  /**
    * Overwrites obj1's values with obj2's and adds
    * obj2's if non existent in obj1
    * @returns obj3 a new object based on obj1 and obj2
    */
  function mergeOptions(obj1, obj2) {
    let obj3 = {};
    for (let attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (let attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  }

  function assert(condition, message) {
    if ( message === void 0 ) message = 'Assertion failed';

    if (!condition) {
      if (typeof Error !== 'undefined') { throw new Error(message); }
      throw message; // Fallback
    }
  }

  function isNumeric(str) {
    return /^\d+$/.test(str);
  }

  /**
   * Pub/Sub
   */
  function pubSub() {
    let topics = {};
    let hOP = topics.hasOwnProperty;
    return {
      subscribe: function (topic, listener) {
        // Create the topic's object if not yet created
        if (!hOP.call(topics, topic)) { topics[topic] = []; }
        // Add the listener to queue
        let index = topics[topic].push(listener) - 1;
        // Provide handle back for removal of topic
        return {
          remove: function () { return delete topics[topic][index]; }
        };
      },
      publish: function (topic, info) {
        // If the topic doesn't exist, or there's no listeners
        // in queue, just leave
        if (!hOP.call(topics, topic)) { return; }
        // Cycle through topics queue, fire!
        topics[topic].forEach(function (item) { return item(info !== undefined ? info : {}); });
      }
    };
  }

  /**
   * @param {Function} publisher instanceof pubSub().
   * @param {Element} element DOM node.
   * @param {String} action 'in' or 'out'.
   * @param {Number|undefined} time ms.
   */
  function fade(publisher, element, time, action) {
    if ( time === void 0 ) time = 300;
    if ( action === void 0 ) action = 'in';

    let opacity;
    let start = null, finished = false;
    let request_id;

    let event_start = action === 'in'
      ? EVENT_TYPE.start_fade_in
      : EVENT_TYPE.start_fade_out;

    let event_end = action === 'in'
      ? EVENT_TYPE.end_fade_in
      : EVENT_TYPE.end_fade_out;

    const tick = function (timestamp) {
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

  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  function addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(function (each) { return addClass(each, classname); });
      return;
    }

    const array = (Array.isArray(classname))
      ? classname
      : classname.split(/\s+/);
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
  function removeClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(function (each) { return removeClass(each, classname, timeout); });
      return;
    }

    const array = (Array.isArray(classname))
      ? classname
      : classname.split(/\s+/);
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
  function hasClass(element, c) {
    // use native if available
    return element.classList
      ? element.classList.contains(c)
      : classRegex(c).test(element.className);
  }

  /**
   * Abstraction to querySelectorAll for increased
   * performance and greater usability
   * @param {String} selector
   * @param {Element} context (optional)
   * @param {Boolean} find_all (optional)
   * @return (find_all) {Element} : {Array}
   */
  function find(selector, context, find_all) {
    if ( context === void 0 ) context = window.document;

    let simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = Array.prototype.slice,
        matches = [];

    // Redirect call to the more performant function
    // if it's a simple selector and return an array
    // for easier usage
    if (simpleRe.test(selector)) {
      switch (selector[0]) {
        case '#':
          matches = [$(selector.substr(1))];
          break;
        case '.':
          matches = slice.call(context.getElementsByClassName(
            selector.substr(1).replace(periodRe, ' ')));
          break;
        default:
          matches = slice.call(context.getElementsByTagName(selector));
      }
    } else {
      // If not a simple selector, query the DOM as usual
      // and return an array for easier usage
      matches = slice.call(context.querySelectorAll(selector));
    }

    return (find_all) ? matches : matches[0];
  }

  function toType(obj) {
    if (obj === window && obj.document && obj.location) { return 'window'; }
    else if (obj === document) { return 'htmldocument'; }
    else if (typeof obj === 'string') { return 'string'; }
    else if (isElement(obj)) { return 'element'; }
  }

  function evaluate(el) {
    let element;
    switch (toType(el)) {
      case 'window':
      case 'htmldocument':
      case 'element':
        element = el;
        break;
      case 'string':
        const t = (el[0] === '#' || el[0] === '.') ? el : '#' + el;
        element = find(t);
        break;
      default:
        console.warn('Unknown type');
    }
    return element;
  }

  function $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  }

  function isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return !!obj
      && typeof obj === 'object'
      && obj.nodeType === 1
      && !!obj.nodeName;
  }

  function getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  }

  function createElement(node, html) {
    let elem;
    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);

      if (node[1].id) { elem.id = node[1].id; }
      if (node[1].classname) { elem.className = node[1].classname; }

      if (node[1].attr) {
        let attr = node[1].attr;
        if (Array.isArray(attr)) {
          let i = -1;
          while (++i < attr.length) {
            elem.setAttribute(attr[i].name, attr[i].value);
          }
        } else {
          elem.setAttribute(attr.name, attr.value);
        }
      }
    } else {
      elem = document.createElement(node);
    }
    elem.innerHTML = html;
    let frag = document.createDocumentFragment();

    while (elem.childNodes[0]) { frag.appendChild(elem.childNodes[0]); }
    elem.appendChild(frag);
    return elem;
  }

  function getWindowSize() {
    return {
      width:
        window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth,
      height:
        window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight
    };
  }

  function getMaxZIndex(zIndex, max, i) {
    if ( max === void 0 ) max = 0;
    if ( i === void 0 ) i = -1;

    const all = find('*', document, true);
    const len = all.length;

    while (++i < len) {
      zIndex = parseInt(window.getComputedStyle(all[i]).zIndex, 10);
      max = (zIndex) ? Math.max(max, zIndex) : max;
    }
    return max;
  }

  function offset(element) {
    const rect = element.getBoundingClientRect();
    const docEl = document.documentElement;
    return {
      left: rect.left + window.pageXOffset - docEl.clientLeft,
      top: rect.top + window.pageYOffset - docEl.clientTop,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  }

  function classRegex(classname) {
    return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
  }

  function _addClass(el, klass, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = (el.className + ' ' + klass).trim();
    }

    if (timeout && isNumeric(timeout)) {
      window.setTimeout(function () { return _removeClass(el, klass); }, timeout);
    }
  }

  function _removeClass(el, klass, timeout) {
    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = (el.className.replace(classRegex(klass), ' ')).trim();
    }
    if (timeout && isNumeric(timeout)) {
      window.setTimeout(function () { return _addClass(el, klass); }, timeout);
    }
  }

  /**
   * @class Html
   */
  var Html = function Html(base) {
    this.Base = base;
  };

  Html.prototype.createPicker = function createPicker () {
    const options = this.Base.options;
    const index_hour = Html.picker.indexOf(Html.replace.hour_list);
    const index_minute = Html.picker.indexOf(Html.replace.minute_list);
    const index_hour_title = Html.picker.indexOf(Html.replace.hour_title);
    const index_minute_title = Html.picker.indexOf(Html.replace.minute_title);
    let hours_html = [], minutes_html = [];
    let minute_zero;
    let i = 0, ii, v = 6, u = 0;

    /** hours **/
    for (; u < 4; u++) {
      ii = i + v;
      hours_html.push('<ol>');
      for (; i < ii; i++) {
        hours_html.push([
          '<li><a ', VARS.attr.hour, '="', i, '">', i, '</a></li>'
        ].join(''));
      }
      hours_html.push('</ol>');
    }

    /** minutes **/
    i = 0; ii = 0; v = 15;
    for (u = 0; u < 4; u++) {
      ii = i + v;
      minutes_html.push('<ol>');
      for (; i < ii; i += 5) {
        minute_zero = (i < 10) ? minute_zero = '0' + i : i;
        minutes_html.push([
          '<li><a ', VARS.attr.minute, '="', minute_zero, '">',
          minute_zero, '</a></li>'
        ].join(''));
      }
      minutes_html.push('</ol>');
    }

    Html.picker[index_hour] = hours_html.join('');
    Html.picker[index_minute] = minutes_html.join('');
    Html.picker[index_hour_title] = LANG[options.lang].hour;
    Html.picker[index_minute_title] = LANG[options.lang].minute;

    const ct = (CLASSNAME.container) + " " + (VARS.namespace) + "-" + (options.theme);
    const container = createElement(
      ['div', { id: VARS.container_id, classname: ct }],
      Html.picker.join('')
    );

    container.style.zIndex = getMaxZIndex() + 10;
    container.style.visibility = 'hidden';
    document.body.appendChild(container);

    const _offset_ = offset(container);

    // store element container and dimensions
    this.Base.container = {
      size: {
        width: _offset_.width,
        height: _offset_.height
      },
      element: container,
      drag_handle: container.querySelector(("." + (CLASSNAME.header)))
    };
    container.style.visibility = '';
    container.style.display = 'none';
    return container;
  };

  Html.replace = {
    hour_list: '__hour-list__',
    minute_list: '__minute-list__',
    hour_title: '__hour-title__',
    minute_title: '__minute-title__'
  };

  /* eslint-disable indent */
  Html.picker = [
    ("<div class=\"" + (CLASSNAME.header) + "\">"),
      ("<div class=\"" + (CLASSNAME.hour) + "\">"),
        Html.replace.hour_title,
      '</div>',
      ("<div class=\"" + (CLASSNAME.minute) + "\">"),
        Html.replace.minute_title,
      '</div>',
    '</div>',
    ("<div class=\"" + (CLASSNAME.body) + "\">"),
      ("<div id=\"" + (VARS.ids.hour_list) + "\" class=\"" + (CLASSNAME.hour) + "\">"),
        Html.replace.hour_list,
      '</div>',
      ("<div id=\"" + (VARS.ids.minute_list) + "\" class=\"" + (CLASSNAME.minute) + "\">"),
        Html.replace.minute_list,
      '</div>',
    '</div>'
  ];
  /* eslint-enable indent */

  /**
   * @class Drag
   */
  var Drag = function Drag(base) {
    let container = base.container.element,
        lastX, lastY, currentX, currentY, x, y,
        when = {},
        dragging = function (evt) {
          evt.preventDefault && evt.preventDefault();

          currentX = parseInt(container.style.left, 10) || 0;
          currentY = parseInt(container.style.top, 10) || 0;
          x = currentX + (evt.clientX - lastX);
          y = currentY + (evt.clientY - lastY);

          when.move.call(undefined, {
            target: container,
            x: x,
            y: y
          });
          lastX = evt.clientX;
          lastY = evt.clientY;
        },
        stopDragging = function () {
          document.removeEventListener('mousemove', dragging, false);
          document.removeEventListener('mouseup', stop, false);
          when.end.call(undefined, {
            target: container,
            x: x,
            y: y
          });
        },
        start = function (evt) {
          if (evt.button !== 0) { return; }

          lastX = evt.clientX;
          lastY = evt.clientY;
          when.start.call({ target: container });
          document.addEventListener('mousemove', dragging, false);
          document.addEventListener('mouseup', stopDragging, false);
        };
    base.container.drag_handle.addEventListener('mousedown', start, false);
    return {
      when: function (obj) {
        when.start = obj.start;
        when.move = obj.move;
        when.end = obj.end;
      }
    };
  };

  /**
   * @class Internal
   */
  var Internal = function Internal(base) {
    this.Base = base;

    this.container = base.container.element;

    // ready to close when both are chosen
    this.closeWhen = { hour: false, minute: false };

    // increment internal ids
    this._ids = 0;

    // active picker
    this.id_active = undefined;

    // is this opened
    this.opened = false;

    // these are targets we're working on
    this.targets = [];

    // this will cache DOM <a> hours (and minutes) array among others
    this.collection = { hours: [], minutes: [] };

    this.pubSub = pubSub();

    this.request_ani_id = undefined;
  };

  Internal.prototype.init = function init () {
    this.setFocusListener(this.Base.target);
    this.setSelectListener();
  };

  Internal.prototype.show = function show (id) {
    const target = this.targets[id].element;
    const target_offset = offset(target);
    const container_offset = this.Base.container.size;
    const top = target_offset.top + target_offset.height + 5;
    const window_ = getWindowSize();

    if (target_offset.left + container_offset.width > window_.width) {
      this.container.style.left = '';
      this.container.style.right = '5px';
    } else {
      this.container.style.right = '';
      this.container.style.left = target_offset.left + 'px';
    }

    if (target_offset.top + container_offset.height > window_.height) {
      this.container.style.bottom = '5px';
    } else {
      this.container.style.top = top + 'px';
    }

    this.pubSub.subscribe(EVENT_TYPE.start_fade_in, function (obj) {
      obj.target.style.opacity = 0;
      obj.target.style.display = 'block';
    });

    this.request_ani_id = fade(this.pubSub, this.container, 400);
    this.Base.dispatchEvent(EVENT_TYPE.open, { element: target });
    this.handleOpen(id);
  };

  Internal.prototype.show_ = function show_ () {
      var this$1 = this;

    this.targets.forEach(function (each) { return this$1.show(each.element._id); });
  };

  Internal.prototype.hide = function hide (id) {
    this.opened = false;
    this.pubSub.subscribe(EVENT_TYPE.start_fade_out, function (obj) {
      obj.target.style.opacity = 1;
      obj.target.style.display = 'block';
    });
    this.pubSub.subscribe(EVENT_TYPE.end_fade_out, function (obj) {
      obj.target.style.display = 'none';
    });
    this.request_ani_id = fade(this.pubSub, this.container, 800, 'out');
    this.Base.dispatchEvent(EVENT_TYPE.close, {
      element: this.targets[id].element
    });
  };

  Internal.prototype.hide_ = function hide_ () {
      var this$1 = this;

    this.targets.forEach(function (each) { return this$1.hide(each.element._id); });
  };

  Internal.prototype.handleOpen = function handleOpen (id) {
      var this$1 = this;

    const this_ = this;
    const hour = this.targets[id].hour;
    const minute = this.targets[id].minute;
    let value;

    removeClass(this.collection.hours, CLASSNAME.selected);
    removeClass(this.collection.minutes, CLASSNAME.selected);

    if (hour && minute) {
      this.collection.hours.forEach(function (element) {
        value = this$1.getHour(element);
        if (value === hour) {
          addClass(element, CLASSNAME.selected);
          return;
        }
      });
      this.collection.minutes.forEach(function (element) {
        value = this$1.getMinute(element);
        if (value === minute) {
          addClass(element, CLASSNAME.selected);
          return;
        }
      });
    }

    //one-time fire
    document.addEventListener('mousedown', {
      handleEvent: function (evt) {
        // click inside Picker
        if (this_.container.contains(evt.target)) { return; }

        let is_clicking_target = false;
        this_.targets.forEach(function (target) {
          if (target.element === evt.target) { is_clicking_target = true; }
        });

        if (!is_clicking_target && this_.opened) { this_.hide(id); }

        if (this_.targets[id].element !== evt.target) {
          document.removeEventListener(evt.type, this, false);
        }
      }
    }, false);

    this.opened = true;
    this.id_active = id;
    this.closeWhen = { hour: false, minute: false };
  };

  Internal.prototype.handleClose = function handleClose (id) {
    if (this.closeWhen.hour && this.closeWhen.minute) { this.hide(id); }
  };

  Internal.prototype.getHour = function getHour (element) {
    return element.getAttribute(VARS.attr.hour);
  };

  Internal.prototype.getMinute = function getMinute (element) {
    return element.getAttribute(VARS.attr.minute);
  };

  Internal.prototype.setSelectListener = function setSelectListener () {
      var this$1 = this;

    const hour_list = $(VARS.ids.hour_list);
    const minute_list = $(VARS.ids.minute_list);
    const selectHour = function (evt) {
      evt.preventDefault();
      const active = this$1.targets[this$1.id_active];

      active.hour = this$1.getHour(evt.target);
      this$1.Base.dispatchEvent(EVENT_TYPE.change, {
        element: active.element,
        hour: active.hour,
        minute: active.minute
      });

      removeClass(this$1.collection.hours, CLASSNAME.selected);
      addClass(evt.target, CLASSNAME.selected);
      this$1.closeWhen.hour = true;
      this$1.handleClose(this$1.id_active);
    };
    const selectMinute = function (evt) {
      evt.preventDefault();
      const active = this$1.targets[this$1.id_active];

      active.minute = this$1.getMinute(evt.target);
      this$1.Base.dispatchEvent(EVENT_TYPE.change, {
        element: active.element,
        hour: active.hour,
        minute: active.minute
      });

      removeClass(this$1.collection.minutes, CLASSNAME.selected);
      addClass(evt.target, CLASSNAME.selected);
      this$1.closeWhen.minute = true;
      this$1.handleClose(this$1.id_active);
    };

    this.collection.hours = getAllChildren(hour_list, 'a');
    this.collection.minutes = getAllChildren(minute_list, 'a');

    this.collection.hours.forEach(function (hour) {
      hour.addEventListener('click', selectHour);
    });
    this.collection.minutes.forEach(function (minute) {
      minute.addEventListener('click', selectMinute);
    });
  };

  Internal.prototype.setFocusListener = function setFocusListener (target) {
      var this$1 = this;

    const triggerShow = function (evt) {
      evt.preventDefault();
      window.cancelAnimationFrame(this$1.request_ani_id);
      this$1.show(evt.target._id);
    };

    let ar_target = [], element;
    // to array if string
    target = Array.isArray(target) ? target : [target];
    // merge
    Array.prototype.push.apply(ar_target, target);

    ar_target.forEach(function (el) {
      element = evaluate(el);
      if (!element) { return; }

      let id = this$1._ids++;
      element._id = id;
      this$1.targets[id] = { element: element };

      if (FOCUSABLE.test(element.nodeName)) {
        element.addEventListener('focus', triggerShow, true);
      } else if (CLICKABLE.test(element.nodeName)) {
        element.addEventListener('click', triggerShow, true);
      }
    });
  };

  /**
   * Based on https://github.com/metafizzy/ev-emitter
   * @class Emitter
   */
  var Emitter = function Emitter() {
    // set events hash
    this._events = this._events || {};
    // set onceEvents hash
    this._onceEvents = this._onceEvents || {};
  };

  Emitter.prototype.on = function on (eventName, listener) {
    if (!eventName || !listener) { return; }
    // set listeners array
    let listeners = this._events[eventName] = this._events[eventName] || [];
    // only add once
    if (listeners.indexOf(listener) === -1) { listeners.push(listener); }
    return this;
  };

  Emitter.prototype.once = function once (eventName, listener) {
    if (!eventName || !listener) { return; }
    // add event
    this.on(eventName, listener);
    // set onceListeners object
    let onceListeners =
      this._onceEvents[eventName] =
        this._onceEvents[eventName] || {};
    // set flag
    onceListeners[listener] = true;
    return this;
  };
  Emitter.prototype.off = function off (eventName, listener) {
    let listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) { return; }
    const index = listeners.indexOf(listener);
    if (index !== -1) { listeners.splice(index, 1); }
    return this;
  };

  Emitter.prototype.dispatchEvent = function dispatchEvent (eventName, obj) {
      var this$1 = this;
      if ( obj === void 0 ) obj = {};

    let listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) { return; }

    let i = 0;
    let listener = listeners[i];
    // once stuff
    const onceListeners = this._onceEvents && this._onceEvents[eventName];

    while (listener) {
      let isOnce = onceListeners && onceListeners[listener];
      if (isOnce) {
        // remove listener
        // remove before trigger to prevent recursion
        this$1.off(eventName, listener);
        // unset once flag
        delete onceListeners[listener];
      }
      // trigger listener
      listener.call(this$1, obj);
      // get next listener
      i += isOnce ? 0 : 1;
      listener = listeners[i];
    }
    return this;
  };

  /**
   * Principal class. Will be passed as argument to others.
   * @class Base
   */
  var Base = (function (Emitter$$1) {
    function Base(target, opt_options) {
      if ( opt_options === void 0 ) opt_options = {};

      assert(
        Array.isArray(target)
          || typeof target === 'string'
          || isElement(target),
        '`target` should be Element, <Array>Element, String or <Array>String.'
      );

      Emitter$$1.call(this);
      this.options = mergeOptions(DEFAULT_OPTIONS, opt_options);
      this.target = target;
      this.container = {};
      const $html = new Html(this);
      const container_el = $html.createPicker();
      const $drag = new Drag(this);
      Base.Internal = new Internal(this);
      Base.Internal.init();

      $drag.when({
        start: function () {
          addClass(container_el, VARS.namespace + VARS.dragging_class);
        },
        move: function (resp) {
          container_el.style.left = (resp.x) + "px";
          container_el.style.top = (resp.y) + "px";
        },
        end: function (resp) {
          removeClass(container_el, VARS.namespace + VARS.dragging_class);
          if (resp.y < 0) { container_el.style.top = 0; }
        }
      });
    }

    if ( Emitter$$1 ) Base.__proto__ = Emitter$$1;
    Base.prototype = Object.create( Emitter$$1 && Emitter$$1.prototype );
    Base.prototype.constructor = Base;

    Base.prototype.show = function show () {
      Base.Internal.show_();
    };

    Base.prototype.hide = function hide () {
      Base.Internal.hide_();
    };

    Base.prototype.setTarget = function setTarget (target) {
      assert(
        Array.isArray(target)
          || typeof target === 'string'
          || isElement(target),
        '`target` should be Element, <Array>Element, String or <Array>String.'
      );
      this.target = target;
      Base.Internal.setFocusListener(this.target);
    };

    return Base;
  }(Emitter));

  return Base;

})));
