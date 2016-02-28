(function(TimePicker, win, doc){

  TimePicker.Utils = {
    whiteSpaceRegex: /\s+/,
    focusable: /^(?:input|select|textarea|button|object)$/i,
    clickable: /^(?:a|area)$/i,
    classRegex: function(classname) {
      return new RegExp('(^|\\s+)' + classname + '(\\s+|$)');
    },
    /**
    * @param {Element|Array<Element>} element DOM node or array of nodes.
    * @param {String|Array<String>} classname Class or array of classes.
    * For example: 'class1 class2' or ['class1', 'class2']
    * @param {Number|undefined} timeout Timeout to remove a class.
    */
    addClass: function(element, classname, timeout){
      if(Array.isArray(element)){
        element.forEach(function(each){
          utils.addClass(each, classname);
        });
        return;
      }
      
      var 
        array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
        i = array.length
      ;
      while(i--){
        if(!utils.hasClass(element, array[i])) {
          utils._addClass(element, array[i], timeout);
        }
      }
    },
    _addClass: function(el, c, timeout){
      // use native if available
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className = (el.className + ' ' + c).trim();
      }
      
      if(timeout && utils.isNumeric(timeout)){
        win.setTimeout(function(){
          utils._removeClass(el, c);
        }, timeout);
      }
    },
    /**
    * @param {Element|Array<Element>} element DOM node or array of nodes.
    * @param {String|Array<String>} classname Class or array of classes.
    * For example: 'class1 class2' or ['class1', 'class2']
    * @param {Number|undefined} timeout Timeout to add a class.
    */
    removeClass: function(element, classname, timeout){
      if(Array.isArray(element)){
        element.forEach(function(each){
          utils.removeClass(each, classname, timeout);
        });
        return;
      }
      
      var 
        array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
        i = array.length
      ;
      while(i--){
        if(utils.hasClass(element, array[i])) {
          utils._removeClass(element, array[i], timeout);
        }
      }
    },
    _removeClass: function(el, c, timeout){
      if (el.classList){
        el.classList.remove(c);
      } else {
        el.className = (el.className.replace(utils.classRegex(c), ' ')).trim();
      }
      if(timeout && utils.isNumeric(timeout)){
        win.setTimeout(function() {
          utils._addClass(el, c);
        }, timeout);
      }
    },
    /**
    * @param {Element} element DOM node.
    * @param {String} classname Classname.
    * @return {Boolean}
    */
    hasClass: function(element, c) {
      // use native if available
      return (element.classList) ?
        element.classList.contains(c) : utils.classRegex(c).test(element.className);
    },
    /**
    * @param {Element|Array<Element>} element DOM node or array of nodes.
    * @param {String} classname Classe.
    */
    toggleClass: function(element, classname){
      if(Array.isArray(element)) {
        element.forEach(function(each) {
          utils.toggleClass(each, classname);
        });
        return;
      }
      
      // use native if available
      if(element.classList) {
        element.classList.toggle(classname);
      } else {
        if(utils.hasClass(element, classname)){
          utils._removeClass(element, classname);
        } else {
          utils._addClass(element, classname);
        }
      }
    },
    $: function(id){
      id = (id[0] === '#') ? id.substr(1, id.length) : id;
      return doc.getElementById(id);
    },
    isElement: function(obj){
      // DOM, Level2
      if ("HTMLElement" in win) {
        return (!!obj && obj instanceof HTMLElement);
      }
      // Older browsers
      return (!!obj && typeof obj === "object" && 
      obj.nodeType === 1 && !!obj.nodeName);
    },
    getAllChildren: function(node, tag){
      return [].slice.call(node.getElementsByTagName(tag));
    },
    getMaxZIndex: function () {
      var zIndex,
        max = 0,
        all = utils.find('*', doc, true),
        len = all.length,
        i = -1
      ;
      while(++i < len){
        zIndex = parseInt(win.getComputedStyle(all[i]).zIndex, 10);
        max = (zIndex) ? Math.max(max, zIndex) : max;
      }
      return max;
    },
    deepExtend: function (destination, source) {
      var property, propertyValue;
  
      for (property in source) if (source.hasOwnProperty(property)) {
        propertyValue = source[property];
        if (propertyValue !== undefined && propertyValue !== null && 
              propertyValue.constructor !== undefined &&
              propertyValue.constructor === Object) {
          destination[property] = destination[property] || {};
          utils.deepExtend(destination[property], propertyValue);
        } else {
          destination[property] = propertyValue;
        }
      }
      return destination;
    },
    createElement: function(node, html){
      var elem;
      if(Array.isArray(node)) {
        elem = doc.createElement(node[0]);
        
        if(node[1].id) elem.id = node[1].id;
        if(node[1].classname) elem.className = node[1].classname;
        
        if(node[1].attr){
          var attr = node[1].attr;
          if(Array.isArray(attr)){
            var i = -1;
            while(++i < attr.length){
              elem.setAttribute(attr[i].name, attr[i].value);
            }
          } else {
            elem.setAttribute(attr.name, attr.value);
          }
        }
      } else {
        elem = doc.createElement(node);
      }
      elem.innerHTML = html;
      var frag = doc.createDocumentFragment();
      
      while (elem.childNodes[0]) {
        frag.appendChild(elem.childNodes[0]);
      }
      elem.appendChild(frag);
      return elem;
    },
    find: function(selector, context, find_all){
      var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/, 
        periodRe = /\./g, 
        slice = [].slice,
        matches = []
      ;
      if(simpleRe.test(selector)){
        switch(selector[0]){
          case '#':
            matches = [utils.$(selector.substr(1))];
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
    offset: function(element){
      var
        rect = element.getBoundingClientRect(),
        docEl = doc.documentElement
      ;
      return {
        left: rect.left + win.pageXOffset - docEl.clientLeft,
        top: rect.top + win.pageYOffset - docEl.clientTop,
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    },
    fadeIn: function(elem, interval) {
      if (+elem.style.opacity < 1) {
        interval = interval || 16;
        elem.style.opacity = 0;
        elem.style.display = 'block';
        var last = +new Date();
        var tick = function() {
          elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
          last = +new Date();
          
          if (+elem.style.opacity < 1) {
            win.setTimeout(tick, interval);
          }
        };
        tick();
      }
      elem.style.display = 'block';
    },
    timeoutID: undefined,
    cancelFadeOut: function(){
      win.clearTimeout(utils.timeoutID);
    },
    fadeOut: function(elem, interval) {
      interval = interval || 16;
      elem.style.opacity = 1;
      var last = +new Date();
      var tick = function() {
        elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
        last = +new Date();
        
        if (+elem.style.opacity > 0) {
          utils.timeoutID = win.setTimeout(tick, interval);
        } else {
          elem.style.display = 'none';
        }
      };
      tick();
    },
    evaluate: function(element) {
      var el;
      switch (utils.toType(element)) {
        case 'window':
        case 'htmldocument':
        case 'element':
          el = element;
          break;
        case 'string':
          el = utils.$(element);
          break;
      }
      utils.assert(el, "Can't evaluate: @param " + element);
      return el;
    },
    toType: function(obj) {
      if(obj == win && obj.doc && obj.location){
        return 'window';
      } else if(obj == doc){
        return 'htmldocument';
      } else if(typeof obj === 'string'){
        return 'string';
      } else if(utils.isElement(obj)){
        return 'element';
      }
    },
    typeOf: function(obj){
      return ({}).toString.call(obj)
        .match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    assert: function(condition, message) {
      if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
          throw new Error(message);
        }
        throw message; // Fallback
      }
    }
  };
  
  /**
   * @author mrdoob / https://github.com/mrdoob/eventdispatcher.js
  */

  TimePicker.EventDispatcher = function () {};

  TimePicker.EventDispatcher.prototype = {

    constructor: TimePicker.EventDispatcher,

    apply: function ( object ) {

      object.addEventListener = object.on = 
        TimePicker.EventDispatcher.prototype.addEventListener;
      object.hasEventListener = 
          TimePicker.EventDispatcher.prototype.hasEventListener;
      object.removeEventListener = object.un = 
        TimePicker.EventDispatcher.prototype.removeEventListener;
      object.dispatchEvent = TimePicker.EventDispatcher.prototype.dispatchEvent;

    },

    addEventListener: function ( type, listener ) {

      if ( this._listeners === undefined ) this._listeners = {};

      var listeners = this._listeners;

      if ( listeners[ type ] === undefined ) {

        listeners[ type ] = [];

      }

      if ( listeners[ type ].indexOf( listener ) === - 1 ) {

        listeners[ type ].push( listener );

      }

    },

    hasEventListener: function ( type, listener ) {

      if ( this._listeners === undefined ) return false;

      var listeners = this._listeners;

      if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

        return true;

      }

      return false;

    },

    removeEventListener: function ( type, listener ) {

      if ( this._listeners === undefined ) return;

      var listeners = this._listeners;
      var listenerArray = listeners[ type ];

      if ( listenerArray !== undefined ) {

        var index = listenerArray.indexOf( listener );

        if ( index !== - 1 ) {

          listenerArray.splice( index, 1 );

        }

      }

    },

    dispatchEvent: function ( event ) {
        
      if ( this._listeners === undefined ) return;

      var listeners = this._listeners;
      var listenerArray = listeners[ event.type ];

      if ( listenerArray !== undefined ) {

        event.target = this;

        var array = [];
        var length = listenerArray.length;

        for ( var i = 0; i < length; i ++ ) {

          array[ i ] = listenerArray[ i ];

        }

        for ( i = 0; i < length; i ++ ) {

          array[ i ].call( this, event );

        }

      }

    }

  };
})(TimePicker, win, doc);