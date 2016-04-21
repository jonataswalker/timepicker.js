import * as constants from './constants';
/**
 * @module utils
 * All the helper functions needed in this project
 */
export default {
  focusable: /^(?:input|select|textarea|button|object)$/i,
  clickable: /^(?:a|area)$/i,
  classRegex(classname) {
    return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.addClass(each, classname) });
      return;
    }
    
    const array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    let i = array.length;
    
    while(i--) {
      if (!this.hasClass(element, array[i])) {
        this._addClass(element, array[i], timeout);
      }
    }
  },
  _addClass(el, c, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(c);
    } else {
      el.className = (el.className +' '+ c).trim();
    }
    
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(() => { this._removeClass(el, c) }, timeout);
    }
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  removeClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.removeClass(each, classname, timeout) });
      return;
    }
    
    const array = (Array.isArray(classname)) ? classname : classname.split(/\s+/);
    let i = array.length;
    
    while(i--) {
      if (this.hasClass(element, array[i])) {
        this._removeClass(element, array[i], timeout);
      }
    }
  },
  _removeClass(el, c, timeout) {
    if (el.classList) {
      el.classList.remove(c);
    } else {
      el.className = (el.className.replace(this.classRegex(c), ' ')).trim();
    }
    if (timeout && this.isNumeric(timeout)) {
      window.setTimeout(() => {
        this._addClass(el, c);
      }, timeout);
    }
  },
  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  hasClass(element, c) {
    // use native if available
    return (element.classList) ?
      element.classList.contains(c) : this.classRegex(c).test(element.className);
  },
  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String} classname Classe.
   */
  toggleClass(element, classname) {
    if (Array.isArray(element)) {
      element.forEach(each => { this.toggleClass(each, classname) });
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
  $(id) {
    id = (id[0] === '#') ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  },
  isElement(obj) {
    // DOM, Level2
    if ('HTMLElement' in window) {
      return (!!obj && obj instanceof HTMLElement);
    }
    // Older browsers
    return (!!obj && typeof obj === 'object' && 
        obj.nodeType === 1 && !!obj.nodeName);
  },
  getAllChildren(node, tag) {
    return [].slice.call(node.getElementsByTagName(tag));
  },
  getMaxZIndex(zIndex, max = 0, i = -1) {
    const all = this.find('*', document, true);
    const len = all.length;

    while(++i < len) {
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
  mergeOptions(obj1, obj2) {
    let obj3 = {};
    for (let attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (let attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
  },
  createElement(node, html) {
    let elem;
    if (Array.isArray(node)) {
      elem = document.createElement(node[0]);
      
      if (node[1].id) elem.id = node[1].id;
      if (node[1].classname) elem.className = node[1].classname;
      
      if (node[1].attr) {
        let attr = node[1].attr;
        if (Array.isArray(attr)) {
          let i = -1;
          while(++i < attr.length) {
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
    
    while (elem.childNodes[0]) {
      frag.appendChild(elem.childNodes[0]);
    }
    elem.appendChild(frag);
    return elem;
  },
  find(selector, context, find_all) {
    let simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
        periodRe = /\./g, 
        slice = [].slice,
        matches = [];
    if (simpleRe.test(selector)) {
      switch(selector[0]) {
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
    } else{
      // If not a simple selector, query the DOM as usual 
      // and return an array for easier usage
      matches = slice.call(context.querySelectorAll(selector));
    }
    
    return (find_all) ? matches : matches[0];
  },
  offset(element) {
    let rect = element.getBoundingClientRect();
    let docEl = document.documentElement;
    return {
      left: rect.left + window.pageXOffset - docEl.clientLeft,
      top: rect.top + window.pageYOffset - docEl.clientTop,
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  },
  getWindowSize() {
    return {
      width:
        window.innerWidth ||
        document.documentElement.clientWidth || document.body.clientWidth,
      height:
        window.innerHeight ||
        document.documentElement.clientHeight || document.body.clientHeight
    };
  },
  evaluate(element) {
    let el;
    switch (this.toType(element)) {
      case 'window':
      case 'htmldocument':
      case 'element':
        el = element;
        break;
      case 'string':
        el = this.$(element);
        break;
    }
    this.assert(el, 'Can\'t evaluate: @param ' + element);
    return el;
  },
  toType(obj) {
    if (obj == window && obj.document && obj.location) {
      return 'window';
    } else if (obj == document) {
      return 'htmldocument';
    } else if (typeof obj === 'string') {
      return 'string';
    } else if (this.isElement(obj)) {
      return 'element';
    }
  },
  typeOf(obj) {
    return ({}).toString.call(obj)
      .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  },
  /**
   * Pub/Sub
   */
  events() {
    let topics = {};
    let hOP = topics.hasOwnProperty;
    
    return {
      subscribe: function(topic, listener) {
        // Create the topic's object if not yet created
        if(!hOP.call(topics, topic)) topics[topic] = [];

        // Add the listener to queue
        let index = topics[topic].push(listener) -1;
        
        // Provide handle back for removal of topic
        return {
          remove: function() {
            delete topics[topic][index];
          }
        };
      },
      publish: function(topic, info) {
        // If the topic doesn't exist, or there's no listeners
        // in queue, just leave
        if(!hOP.call(topics, topic)) return;
      
        // Cycle through topics queue, fire!
        topics[topic].forEach(function(item) {
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
  fade(publisher, element, time = 300, action = 'in') {
    let opacity;
    let start = null, finished = false;
    let request_id;
    
    let event_start = action == 'in' ? 
      constants.eventType.start_fade_in : constants.eventType.start_fade_out;
    
    let event_end = action == 'in' ? 
      constants.eventType.end_fade_in : constants.eventType.end_fade_out;
    
    const tick = timestamp => {
      if (!start) {
        publisher.publish(event_start, {
          target: element
        });
        
        start = timestamp;
      }
      
      if (action == 'in') {
        opacity = +element.style.opacity + (timestamp - start) / time;
        finished = opacity >= 1;
      } else {
        opacity = +element.style.opacity - (timestamp - start) / time;
        finished = opacity <= 0;
      }
      
      element.style.opacity = opacity;
      
      if (finished) {
        publisher.publish(event_end, {
          target: element
        });
      } else {
        request_id = window.requestAnimationFrame(tick);
      }
    };
    
    request_id = window.requestAnimationFrame(tick);
    
    return request_id;
  },
  assert(condition, message) {
    if (!condition) {
      message = message || 'Assertion failed';
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  }
}
