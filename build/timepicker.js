/*!
 * timepicker.js - v2.2.0
 * A lightweight, customizable, TimePicker. Zero dependencies.
 * https://github.com/jonataswalker/timepicker.js
 * Built: Sat Jan 28 2017 15:26:36 GMT-0200 (BRST)
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.TimePicker = factory());
}(this, (function () { 'use strict';

var namespace = "_jw-tpk";
var width = "250px";
var height = "140px";
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

var _VARS = Object.freeze({
	namespace: namespace,
	width: width,
	height: height,
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

var eventType = {
  open: 'open',
  close: 'close',
  change: 'change',
  start_fade_in: 'start-fade-in',
  end_fade_in: 'end-fade-in',
  start_fade_out: 'start-fade-out',
  end_fade_out: 'end-fade-out'
};

var defaultOptions = {
  lang: 'en',
  theme: 'dark'
};

var lang = {
  en: {
    hour: 'Hour',
    minute: 'Minute'
  },
  pt: {
    hour: 'Hora',
    minute: 'Minuto'
  }
};

var VARS = _VARS;

/**
 * DOM Elements classname
 */
var CLASSNAME = {
  container : namespace + container_class,
  header    : namespace + header_class,
  body      : namespace + body_class,
  hour      : namespace + hour_class,
  minute    : namespace + minute_class,
  selected  : namespace + selected_class,
  dragging  : namespace + dragging_class
};

/**
 * @module utils
 * All the helper functions needed in this project
 */
var utils = {
  focusable: /^(?:input|select|textarea|button|object)$/i,
  clickable: /^(?:a|area)$/i,
  classRegex: function classRegex(classname) {
    return new RegExp(("(^|\\s+) " + classname + " (\\s+|$)"));
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  addClass: function addClass(element, classname, timeout) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.addClass(each, classname);
      });
      return;
    }

    var array = (Array.isArray(classname)) ?
        classname : classname.split(/\s+/);
    var i = array.length;

    while (i--) {
      if (!this$1.hasClass(element, array[i])) {
        this$1._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass: function _addClass(el, klass, timeout) {
    var this$1 = this;

    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = (el.className + ' ' + klass).trim();
    }

    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(function () {
        this$1._removeClass(el, klass);
      }, timeout);
    }
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  removeClass: function removeClass(element, classname, timeout) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) {
        this$1.removeClass(each, classname, timeout);
      });
      return;
    }

    var array = (Array.isArray(classname)) ?
        classname : classname.split(/\s+/);
    var i = array.length;

    while (i--) {
      if (this$1.hasClass(element, array[i])) {
        this$1._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass: function _removeClass(el, klass, timeout) {
    var this$1 = this;

    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = (el.className.replace(this.classRegex(klass), ' ')).trim();
    }
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(function () {
        this$1._addClass(el, klass);
      }, timeout);
    }
  },
  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  hasClass: function hasClass(element, c) {
    // use native if available
    return (element.classList)
        ? element.classList.contains(c)
        : this.classRegex(c).test(element.className);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String} classname Classe.
   */
  toggleClass: function toggleClass(element, classname) {
    var this$1 = this;

    if (Array.isArray(element)) {
      element.forEach(function (each) { this$1.toggleClass(each, classname); });
      return;
    }

    // use native if available
    if (element.classList) {
      element.classList.toggle(classname);
    } else {
      if (this.hasClass(element, classname)) {
        this._removeClass(element, classname);
      } else {
        this._addClass(element, classname);
      }
    }
  },
  $: function $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement: function isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' &&
        obj.nodeType === 1 && !!obj.nodeName);
  },
  getAllChildren: function getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  },
  getMaxZIndex: function getMaxZIndex(zIndex, max, i) {
    if ( max === void 0 ) max = 0;
    if ( i === void 0 ) i = -1;

    var all = this.find('*', document, true);
    var len = all.length;

    while (++i < len) {
      zIndex = parseInt(window.getComputedStyle(all[i]).zIndex, 10);
      max = (zIndex) ? Math.max(max, zIndex) : max;
    }
    return max;
  },
  /**
   * Overwrites obj1's values with obj2's and adds
   * obj2's if non existent in obj1
   * @returns {Object} a new object based on obj1 and obj2
   */
  mergeOptions: function mergeOptions(obj1, obj2) {
    var obj3 = {};
    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  createElement: function createElement(node, html) {
    var elem;
    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);

      if (node[1].id) { elem.id = node[1].id; }
      if (node[1].classname) { elem.className = node[1].classname; }

      if (node[1].attr) {
        var attr = node[1].attr;
        if (Array.isArray(attr)) {
          var i = -1;
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
    var frag = document.createDocumentFragment();

    while (elem.childNodes[0]) {
      frag.appendChild(elem.childNodes[0]);
    }
    elem.appendChild(frag);
    return elem;
  },
  find: function find(selector, context, find_all) {
    var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
        periodRe = /\./g,
        slice = [].slice,
        matches = [];
    if (simpleRe.test(selector)) {
      switch (selector[0]) {
        case '#':
          matches = [this.$(selector.substr(1))];
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
  },
  offset: function offset(element) {
    var rect = element.getBoundingClientRect();
    var docEl = document.documentElement;
    return {
      left: rect.left + window.pageXOffset - docEl.clientLeft,
      top: rect.top + window.pageYOffset - docEl.clientTop,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  },
  getWindowSize: function getWindowSize() {
    return {
      width:
        window.innerWidth ||
        document.documentElement.clientWidth || document.body.clientWidth,
      height:
        window.innerHeight ||
        document.documentElement.clientHeight || document.body.clientHeight
    };
  },
  evaluate: function evaluate(element) {
    var el;
    switch (this.toType(element)) {
      case 'window':
      case 'htmldocument':
      case 'element':
        el = element;
        break;
      case 'string':
        el = this.$(element);
        break;
      default:
        console.warn('Unknown type');
    }
    this.assert(el, 'Can\'t evaluate: @param ' + element);
    return el;
  },
  toType: function toType(obj) {
    if (obj === window && obj.document && obj.location) {
      return 'window';
    } else if (obj === document) {
      return 'htmldocument';
    } else if (typeof obj === 'string') {
      return 'string';
    } else if (this.isElement(obj)) {
      return 'element';
    }
  },
  typeOf: function typeOf(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  },
  /**
   * Pub/Sub
   */
  events: function events() {
    var topics = {};
    var hOP = topics.hasOwnProperty;
    return {
      subscribe: function (topic, listener) {
        // Create the topic's object if not yet created
        if (!hOP.call(topics, topic)) { topics[topic] = []; }
        // Add the listener to queue
        var index = topics[topic].push(listener) - 1;
        // Provide handle back for removal of topic
        return {
          remove: function () {
            delete topics[topic][index];
          }
        };
      },
      publish: function (topic, info) {
        // If the topic doesn't exist, or there's no listeners
        // in queue, just leave
        if (!hOP.call(topics, topic)) { return; }
        // Cycle through topics queue, fire!
        topics[topic].forEach(function (item) {
          item(info !== undefined ? info : {});
        });
      }
    };
  },
  /**
   * @param {Function} publisher instanceof this.events().
   * @param {Element} element DOM node.
   * @param {String} action 'in' or 'out'.
   * @param {Number|undefined} time ms.
   */
  fade: function fade(publisher, element, time, action) {
    if ( time === void 0 ) time = 300;
    if ( action === void 0 ) action = 'in';

    var opacity;
    var start = null, finished = false;
    var request_id;

    var event_start = action === 'in'
        ? eventType.start_fade_in
        : eventType.start_fade_out;

    var event_end = action === 'in'
        ? eventType.end_fade_in
        : eventType.end_fade_out;

    var tick = function (timestamp) {
      if (!start) {
        publisher.publish(event_start, {
          target: element
        });
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
  },
  assert: function assert(condition, message) {
    if (!condition) {
      message = message || 'Assertion failed';
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  }
};

/**
 * @class Html
 */
var Html = function Html(base) {
  this.Base = base;
};

Html.prototype.createPicker = function createPicker () {
  var options = this.Base.options;
  var index_hour = Html.picker.indexOf(Html.replace.hour_list);
  var index_minute = Html.picker.indexOf(Html.replace.minute_list);
  var index_hour_title = Html.picker.indexOf(Html.replace.hour_title);
  var index_minute_title = Html.picker.indexOf(Html.replace.minute_title);
  var hours_html = [], minutes_html = [];
  var minute_zero;
  var i = 0, ii, v = 6, u = 0;

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
  Html.picker[index_hour_title] = lang[options.lang].hour;
  Html.picker[index_minute_title] = lang[options.lang].minute;

  var container = utils.createElement([
    'div', { classname:
      CLASSNAME.container + ' ' + VARS.namespace + '-' + options.theme }
  ], Html.picker.join(''));

  container.style.zIndex = utils.getMaxZIndex() + 10;
  container.style.visibility = 'hidden';
  document.body.appendChild(container);

  var offset = utils.offset(container);

  // store element container and dimensions
  this.Base.container = {
    size: {
      width: offset.width,
      height: offset.height
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
  var container = base.container.element,
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
  this.collection = {
    hours: [],
    minutes: []
  };

  this.events = utils.events();

  this.request_ani_id = undefined;
};

Internal.prototype.init = function init () {
  this.setFocusListener(this.Base.target);
  this.setSelectListener();
};

Internal.prototype.show = function show (id) {
  var target = this.targets[id].element;
  var target_offset = utils.offset(target);
  var container_offset = this.Base.container.size;
  var top = target_offset.top + target_offset.height + 5;
  var window_ = utils.getWindowSize();

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

  this.events.subscribe(eventType.start_fade_in, function (obj) {
    obj.target.style.opacity = 0;
    obj.target.style.display = 'block';
  });

  this.request_ani_id = utils.fade(this.events, this.container, 400);
  this.Base.dispatchEvent(eventType.open, { element: target });
  this.handleOpen(id);
};

Internal.prototype.show_ = function show_ () {
    var this$1 = this;

  this.targets.forEach(function (each) { this$1.show(each.element._id); });
};

Internal.prototype.hide = function hide (id) {
  this.opened = false;
  this.events.subscribe(eventType.start_fade_out, function (obj) {
    obj.target.style.opacity = 1;
    obj.target.style.display = 'block';
  });
  this.events.subscribe(eventType.end_fade_out, function (obj) {
    obj.target.style.display = 'none';
  });
  this.request_ani_id = utils.fade(this.events, this.container, 800, 'out');
  this.Base.dispatchEvent(eventType.close, {
    element: this.targets[id].element
  });
};

Internal.prototype.hide_ = function hide_ () {
    var this$1 = this;

  this.targets.forEach(function (each) { this$1.hide(each.element._id); });
};

Internal.prototype.handleOpen = function handleOpen (id) {
    var this$1 = this;

  var this_ = this;
  var hour = this.targets[id].hour;
  var minute = this.targets[id].minute;
  var value;

  utils.removeClass(this.collection.hours, CLASSNAME.selected);
  utils.removeClass(this.collection.minutes, CLASSNAME.selected);

  if (hour && minute) {
    this.collection.hours.forEach(function (element) {
      value = this$1.getHour(element);
      if (value === hour) {
        utils.addClass(element, CLASSNAME.selected);
        return;
      }
    });
    this.collection.minutes.forEach(function (element) {
      value = this$1.getMinute(element);
      if (value === minute) {
        utils.addClass(element, CLASSNAME.selected);
        return;
      }
    });
  }

  //one-time fire
  document.addEventListener('mousedown', {
    handleEvent: function (evt) {
      // click inside Picker
      if (this_.container.contains(evt.target)) { return; }

      var is_clicking_target = false;
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
  this.closeWhen = {
    hour: false,
    minute: false
  };
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

  var hour_list = utils.$(VARS.ids.hour_list);
  var minute_list = utils.$(VARS.ids.minute_list);
  var selectHour = function (evt) {
    evt.preventDefault();
    var active = this$1.targets[this$1.id_active];

    active.hour = this$1.getHour(evt.target);
    this$1.Base.dispatchEvent(eventType.change, {
      element: active.element,
      hour: active.hour,
      minute: active.minute
    });

    utils.removeClass(this$1.collection.hours, CLASSNAME.selected);
    utils.addClass(evt.target, CLASSNAME.selected);
    this$1.closeWhen.hour = true;
    this$1.handleClose(this$1.id_active);
  };
  var selectMinute = function (evt) {
    evt.preventDefault();
    var active = this$1.targets[this$1.id_active];

    active.minute = this$1.getMinute(evt.target);
    this$1.Base.dispatchEvent(eventType.change, {
      element: active.element,
      hour: active.hour,
      minute: active.minute
    });

    utils.removeClass(this$1.collection.minutes, CLASSNAME.selected);
    utils.addClass(evt.target, CLASSNAME.selected);
    this$1.closeWhen.minute = true;
    this$1.handleClose(this$1.id_active);
  };

  this.collection.hours = utils.getAllChildren(hour_list, 'a');
  this.collection.minutes = utils.getAllChildren(minute_list, 'a');

  this.collection.hours.forEach(function (hour) {
    hour.addEventListener('click', selectHour);
  });
  this.collection.minutes.forEach(function (minute) {
    minute.addEventListener('click', selectMinute);
  });
};

Internal.prototype.setFocusListener = function setFocusListener (target) {
    var this$1 = this;

  var triggerShow = function (evt) {
    evt.preventDefault();
    window.cancelAnimationFrame(this$1.request_ani_id);
    this$1.show(evt.target._id);
  };

  var ar_target = [], element;
  // to array if string
  target = Array.isArray(target) ? target : [target];
  // merge
  Array.prototype.push.apply(ar_target, target);

  ar_target.forEach(function (el) {
    element = utils.evaluate(el);
    if (!element) { return; }

    var id = this$1._ids++;
    element._id = id;
    this$1.targets[id] = { element: element };

    if (utils.focusable.test(element.nodeName)) {
      element.addEventListener('focus', triggerShow, true);
    } else if (utils.clickable.test(element.nodeName)) {
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
  var listeners = this._events[eventName] = this._events[eventName] || [];
  // only add once
  if (listeners.indexOf(listener) === -1) { listeners.push(listener); }
  return this;
};

Emitter.prototype.once = function once (eventName, listener) {
  if (!eventName || !listener) { return; }
  // add event
  this.on(eventName, listener);
  // set onceListeners object
  var onceListeners =
    this._onceEvents[eventName] =
      this._onceEvents[eventName] || {};
  // set flag
  onceListeners[listener] = true;
  return this;
};
Emitter.prototype.off = function off (eventName, listener) {
  var listeners = this._events && this._events[eventName];
  if (!listeners || !listeners.length) { return; }
  var index = listeners.indexOf(listener);
  if (index !== -1) { listeners.splice(index, 1); }
  return this;
};

Emitter.prototype.dispatchEvent = function dispatchEvent (eventName, obj) {
    var this$1 = this;
    if ( obj === void 0 ) obj = {};

  var listeners = this._events && this._events[eventName];
  if (!listeners || !listeners.length) { return; }

  var i = 0;
  var listener = listeners[i];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[eventName];

  while (listener) {
    var isOnce = onceListeners && onceListeners[listener];
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

    utils.assert(Array.isArray(target)
        || utils.typeOf(target) === 'string'
        || utils.isElement(target),
        '`target` should be Element, <Array>Element, String or <Array>String.'
    );
    Emitter$$1.call(this);
    this.options = utils.mergeOptions(defaultOptions, opt_options);
    this.target = target;
    this.container = {};
    var $html = new Html(this);
    var container_el = $html.createPicker();
    var $drag = new Drag(this);
    Base.Internal = new Internal(this);
    Base.Internal.init();

    $drag.when({
      start: function () {
        utils.addClass(container_el, namespace + dragging_class);
      },
      move: function (resp) {
        container_el.style.left = (resp.x) + "px";
        container_el.style.top = (resp.y) + "px";
      },
      end: function (resp) {
        utils.removeClass(container_el, namespace + dragging_class);
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
    utils.assert(Array.isArray(target)
        || utils.typeOf(target) === 'string'
        || utils.isElement(target),
        '`target` should be Element, <Array>Element, String or <Array>String.'
    );
    this.target = target;
    Base.Internal.setFocusListener(this.target);
  };

  return Base;
}(Emitter));

return Base;

})));
