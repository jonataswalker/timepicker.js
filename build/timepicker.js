// Yet Another (framework free) Timepicker.
// https://github.com/jonataswalker/timepicker.js
// Version: v1.0.0
// Built: 2016-02-29T13:58:04-0300

(function(win, doc) {
  'use strict';

  var TimePicker = (function() {

      // internal
      var _TimePicker;

      /**
       * @constructor
       * @param {String|Array<String>|Element|Array<Element>} target String or 
       * array of string, DOM node or array of nodes.
       * @param {Object|undefined} opt_options Options.
       */
      var TimePicker = function(target, opt_options) {
        utils.assert(Array.isArray(target) || utils.typeOf(target) == 'string',
          '@param `target` should be String or Array.');

        var defaultOptions = utils.deepExtend({}, TimePicker.defaultOptions);
        this.options = utils.deepExtend(defaultOptions, opt_options);
        this.target = target;

        // container size
        this.container_size = {
          width: 0,
          height: 0
        };

        var $html = new TimePicker.Html(this);
        var container = $html.createPicker();
        var $drag = new TimePicker.Drag();
        _TimePicker = new TimePicker.Internal(this);

        $drag.when({
          start: function() {
            container.style.opacity = '';
            utils.addClass(container, 'dragging');
          },
          move: function() {
            container.style.left = this.x + 'px';
            container.style.top = this.y + 'px';
          },
          end: function() {
            utils.removeClass(container, 'dragging');
            if (this.y < 0) container.style.top = 0;
          }
        });

        _TimePicker.init();
      };

      TimePicker.prototype = {
        show: function(target) {
          _TimePicker.show(utils.evaluate(target));
        },
        hide: function() {
          _TimePicker.hide();
        }

      };


      TimePicker.EventType = {
        open: 'open',
        close: 'close',
        change: 'change'
      };

      TimePicker.defaultOptions = {
        lang: 'en'
      };

      TimePicker.lang = {
        en: {
          hour: 'Hour',
          minute: 'Minute'
        },
        pt: {
          hour: 'Hora',
          minute: 'Minuto'
        }
      };

      TimePicker.constants = {
        container_class: '_jw-timepicker',
        selected_class: 'selected',
        header_class: '_jw-timepicker-header',
        hour_attr: 'data-hour',
        minute_attr: 'data-minute',
        hour_list_id: 'hour_list_id',
        minute_list_id: 'minute_list_id'
      };
      TimePicker.elements = {};
      (function(TimePicker, win, doc) {

        TimePicker.Internal = function(picker) {
          this.Picker = picker;

          // ready to close when both are chosen
          this.closeWhen = {
            hour: false,
            minute: false
          };

          // increment internal ids
          this._ids = 0;

          // active picker
          this.id_active = undefined;

          // is it selecting?
          this.selecting = false;

          // these are targets we're working on
          this.targets = [];

          // this will cache DOM <a> hours (and minutes) array among others
          this.collection = {
            hours: [],
            minutes: []
          };
        };
        TimePicker.Internal.prototype = {
          init: function() {
            this.setFocusListener(this.Picker.target);
            this.setSelectListener();
          },
          show: function(id) {
            var target = this.targets[id].element;
            var container = TimePicker.elements.container;
            var target_offset = utils.offset(target);
            var container_offset = this.Picker.container_size;
            var top = target_offset.top + target_offset.height + 5;

            console.info('target_offset', target_offset);
            console.info('container_offset', this.Picker.container_size);
            console.info('getWindowSize', utils.getWindowSize());

            if (target_offset.left + container_offset.width > utils.getWindowSize().width) {
              container.style.left = '';
              container.style.right = '5px';
            } else {
              container.style.right = '';
              container.style.left = target_offset.left + 'px';
            }

            container.style.top = top + 'px';
            utils.fadeIn(container);

            this.Picker.dispatchEvent({
              type: TimePicker.EventType.open,
              element: target
            });

            this.handleOpen(id);
          },
          hide: function() {
            this.selecting = false;
            utils.fadeOut(TimePicker.elements.container);
            this.Picker.dispatchEvent({
              type: TimePicker.EventType.close,
              element: this.targets[this.id_active].element
            });
          },
          handleOpen: function(id) {
            var this_ = this;
            var value;
            var sel_class = TimePicker.constants.selected_class;

            utils.removeClass(this.collection.hours, sel_class);
            utils.removeClass(this.collection.minutes, sel_class);

            var hour = this.targets[id].hour;
            var minute = this.targets[id].minute;
            if (hour && minute) {
              this.collection.hours.forEach(function(element) {
                value = this_.getHour(element);
                if (value == hour) {
                  utils.addClass(element, sel_class);
                  return;
                }
              });

              this.collection.minutes.forEach(function(element) {
                value = this_.getMinute(element);
                if (value == minute) {
                  utils.addClass(element, sel_class);
                  return;
                }
              });
            }

            //one-time fire
            doc.addEventListener('mousedown', {
              handleEvent: function(evt) {
                if (TimePicker.elements.container.contains(evt.target)) return;
                if (this_.selecting) this_.hide();
                doc.removeEventListener(evt.type, this, false);
              }
            }, false);

            this.selecting = true;
            this.id_active = id;
            this.closeWhen = {
              hour: false,
              minute: false
            };
          },
          handleClose: function() {
            if (this.closeWhen.hour && this.closeWhen.minute) {
              this.hide();
            }
          },
          getHour: function(element) {
            return element.getAttribute(TimePicker.constants.hour_attr);
          },
          getMinute: function(element) {
            return element.getAttribute(TimePicker.constants.minute_attr);
          },
          setSelectListener: function() {
            var this_ = this;
            var constants = TimePicker.constants;
            var hour_list = utils.$(constants.hour_list_id);
            var minute_list = utils.$(constants.minute_list_id);

            this.collection.hours = utils.getAllChildren(hour_list, 'a');
            this.collection.minutes = utils.getAllChildren(minute_list, 'a');

            var selectHour = function(evt) {
              evt.preventDefault();
              var active = this_.targets[this_.id_active];

              active.hour = this_.getHour(evt.target);
              this_.Picker.dispatchEvent({
                type: TimePicker.EventType.change,
                element: active.element,
                hour: active.hour,
                minute: active.minute
              });

              utils.removeClass(this_.collection.hours, constants.selected_class);
              utils.addClass(evt.target, constants.selected_class);
              this_.closeWhen.hour = true;
              this_.handleClose();
            };
            var selectMinute = function(evt) {
              evt.preventDefault();
              var active = this_.targets[this_.id_active];

              active.minute = this_.getMinute(evt.target);
              this_.Picker.dispatchEvent({
                type: TimePicker.EventType.change,
                element: active.element,
                hour: active.hour,
                minute: active.minute
              });

              utils.removeClass(this_.collection.minutes, constants.selected_class);
              utils.addClass(evt.target, constants.selected_class);
              this_.closeWhen.minute = true;
              this_.handleClose();
            };

            this.collection.hours.forEach(function(hour) {
              hour.addEventListener('click', selectHour);
            });
            this.collection.minutes.forEach(function(minute) {
              minute.addEventListener('click', selectMinute);
            });

          },
          setFocusListener: function(target) {
            var this_ = this;
            var triggerShow = function(evt) {
              evt.preventDefault();
              utils.cancelFadeOut();
              this_.show(evt.target._id);
            };

            var ar_target = [],
              element;
            // to array if string
            target = Array.isArray(target) ? target : [target];
            // merge
            Array.prototype.push.apply(ar_target, target);

            ar_target.forEach(function(el, i) {
              element = utils.evaluate(el);

              if (!element) return;

              var id = this_._ids++;
              element._id = id;
              this_.targets[id] = {
                element: element
              };

              if (utils.focusable.test(element.nodeName)) {
                element.addEventListener('focus', triggerShow, true);
              } else if (utils.clickable.test(element.nodeName)) {
                element.addEventListener('click', triggerShow, true);
              }
            });
          }
        };

      })(TimePicker, win, doc);
      (function(TimePicker, win, doc) {

        TimePicker.Html = function(picker) {
          this.Picker = picker;
        };
        TimePicker.Html.prototype = {
          createPicker: function() {
            var options = this.Picker.options;
            var constants = TimePicker.constants;
            var replace = TimePicker.Html.replace;
            var html = TimePicker.Html.picker;
            var index_hour = html.indexOf(replace.hour_list);
            var index_minute = html.indexOf(replace.minute_list);
            var index_hour_title = html.indexOf(replace.hour_title);
            var index_minute_title = html.indexOf(replace.minute_title);
            var hours_html = [],
              minutes_html = [];
            var minute_zero;

            var i = 0,
              ii, v = 6;

            /** hours **/
            for (var u = 0; u < 4; u++) {
              ii = i + v;
              hours_html.push('<ol>');
              for (; i < ii; i++) {
                hours_html.push('<li><a href="javascript:void(0)" ' + constants.hour_attr +
                  '="' + i + '">' + i + '</a></li>');
              }
              hours_html.push('</ol>');
            }

            /** minutes **/
            i = 0;
            ii = 0;
            v = 15;
            for (u = 0; u < 4; u++) {
              ii = i + v;
              minutes_html.push('<ol>');
              for (; i < ii; i += 5) {
                minute_zero = (i < 10) ? minute_zero = '0' + i : i;
                minutes_html.push('<li><a href="javascript:void(0)" ' +
                  constants.minute_attr + '="' + minute_zero + '">' + minute_zero + '</a></li>');
              }
              minutes_html.push('</ol>');
            }

            html[index_hour] = hours_html.join('');
            html[index_minute] = minutes_html.join('');
            html[index_hour_title] = TimePicker.lang[options.lang].hour;
            html[index_minute_title] = TimePicker.lang[options.lang].minute;


            var container = utils.createElement([
              'div', {
                classname: constants.container_class
              }
            ], html.join(''));

            container.style.zIndex = utils.getMaxZIndex() + 10;
            container.style.visibility = 'hidden';
            doc.body.appendChild(container);

            // store container dimensions
            var offset = utils.offset(container);
            this.Picker.container_size = {
              width: offset.width,
              height: offset.height
            };

            // hide it completely
            container.style.display = 'none';
            container.style.visibility = 'visible';

            TimePicker.elements = {
              container: container,
              drag_handle: container.querySelector('.' + constants.header_class)
            };
            return container;
          }
        };

        TimePicker.Html.replace = {
          hour_list: '__hour-list__',
          minute_list: '__minute-list__',
          hour_title: '__hour-title__',
          minute_title: '__minute-title__'
        };

        TimePicker.Html.picker = [
          '<div class="' + TimePicker.constants.header_class + ' _jw-timepicker-clearfix">',
          '<div class="_jw-timepicker-hour">',
          TimePicker.Html.replace.hour_title,
          '</div>',
          '<div class="_jw-timepicker-minute">',
          TimePicker.Html.replace.minute_title,
          '</div>',
          '</div>',
          '<div class="_jw-timepicker-body _jw-timepicker-clearfix">',
          '<div id="' + TimePicker.constants.hour_list_id + '" class="_jw-timepicker-hour">',
          TimePicker.Html.replace.hour_list,
          '</div>',
          '<div id="' + TimePicker.constants.minute_list_id + '" class="_jw-timepicker-minute">',
          TimePicker.Html.replace.minute_list,
          '</div>',
          '</div>'
        ];
      })(TimePicker, win, doc);
      (function(TimePicker, win, doc) {

        TimePicker.Drag = function() {
          var
            container = TimePicker.elements.container,
            handle = TimePicker.elements.drag_handle || container,
            lastX, lastY, currentX, currentY, startX, startY, x, y,
            when = {},
            start = function(evt) {
              if (evt.button !== 0) return;
              lastX = evt.clientX;
              lastY = evt.clientY;
              when.start.call({
                target: container
              });
              doc.addEventListener('mousemove', dragging, false);
              doc.addEventListener('mouseup', stopDragging, false);
            },
            dragging = function(evt) {
              /* jshint -W030 */
              evt.preventDefault && evt.preventDefault();

              currentX = parseInt(container.style.left, 10) || 0;
              currentY = parseInt(container.style.top, 10) || 0;

              x = currentX + (evt.clientX - lastX);
              y = currentY + (evt.clientY - lastY);

              when.move.call({
                target: container,
                x: x,
                y: y
              });
              lastX = evt.clientX;
              lastY = evt.clientY;
            },
            stopDragging = function(evt) {
              doc.removeEventListener('mousemove', dragging, false);
              doc.removeEventListener('mouseup', stop, false);

              when.end.call({
                target: container,
                x: x,
                y: y
              });
            };
          handle.addEventListener('mousedown', start, false);
          return {
            when: function(obj) {
              when.start = obj.start;
              when.move = obj.move;
              when.end = obj.end;
            }
          };
        };
      })(TimePicker, win, doc);
      (function(TimePicker, win, doc) {

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
          addClass: function(element, classname, timeout) {
            if (Array.isArray(element)) {
              element.forEach(function(each) {
                utils.addClass(each, classname);
              });
              return;
            }

            var
              array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
              i = array.length;
            while (i--) {
              if (!utils.hasClass(element, array[i])) {
                utils._addClass(element, array[i], timeout);
              }
            }
          },
          _addClass: function(el, c, timeout) {
            // use native if available
            if (el.classList) {
              el.classList.add(c);
            } else {
              el.className = (el.className + ' ' + c).trim();
            }

            if (timeout && utils.isNumeric(timeout)) {
              win.setTimeout(function() {
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
          removeClass: function(element, classname, timeout) {
            if (Array.isArray(element)) {
              element.forEach(function(each) {
                utils.removeClass(each, classname, timeout);
              });
              return;
            }

            var
              array = (Array.isArray(classname)) ? classname : classname.split(/\s+/),
              i = array.length;
            while (i--) {
              if (utils.hasClass(element, array[i])) {
                utils._removeClass(element, array[i], timeout);
              }
            }
          },
          _removeClass: function(el, c, timeout) {
            if (el.classList) {
              el.classList.remove(c);
            } else {
              el.className = (el.className.replace(utils.classRegex(c), ' ')).trim();
            }
            if (timeout && utils.isNumeric(timeout)) {
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
          toggleClass: function(element, classname) {
            if (Array.isArray(element)) {
              element.forEach(function(each) {
                utils.toggleClass(each, classname);
              });
              return;
            }

            // use native if available
            if (element.classList) {
              element.classList.toggle(classname);
            } else {
              if (utils.hasClass(element, classname)) {
                utils._removeClass(element, classname);
              } else {
                utils._addClass(element, classname);
              }
            }
          },
          $: function(id) {
            id = (id[0] === '#') ? id.substr(1, id.length) : id;
            return doc.getElementById(id);
          },
          isElement: function(obj) {
            // DOM, Level2
            if ("HTMLElement" in win) {
              return (!!obj && obj instanceof HTMLElement);
            }
            // Older browsers
            return (!!obj && typeof obj === "object" &&
              obj.nodeType === 1 && !!obj.nodeName);
          },
          getAllChildren: function(node, tag) {
            return [].slice.call(node.getElementsByTagName(tag));
          },
          getMaxZIndex: function() {
            var zIndex,
              max = 0,
              all = utils.find('*', doc, true),
              len = all.length,
              i = -1;
            while (++i < len) {
              zIndex = parseInt(win.getComputedStyle(all[i]).zIndex, 10);
              max = (zIndex) ? Math.max(max, zIndex) : max;
            }
            return max;
          },
          deepExtend: function(destination, source) {
            var property, propertyValue;

            for (property in source)
              if (source.hasOwnProperty(property)) {
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
          createElement: function(node, html) {
            var elem;
            if (Array.isArray(node)) {
              elem = doc.createElement(node[0]);

              if (node[1].id) elem.id = node[1].id;
              if (node[1].classname) elem.className = node[1].classname;

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
          find: function(selector, context, find_all) {
            var simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
              periodRe = /\./g,
              slice = [].slice,
              matches = [];
            if (simpleRe.test(selector)) {
              switch (selector[0]) {
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
            } else {
              // If not a simple selector, query the DOM as usual 
              // and return an array for easier usage
              matches = slice.call(context.querySelectorAll(selector));
            }

            return (find_all) ? matches : matches[0];
          },
          offset: function(element) {
            var
              rect = element.getBoundingClientRect(),
              docEl = doc.documentElement;
            return {
              left: rect.left + win.pageXOffset - docEl.clientLeft,
              top: rect.top + win.pageYOffset - docEl.clientTop,
              width: element.offsetWidth,
              height: element.offsetHeight
            };
          },
          getWindowSize: function() {
            return {
              width: win.innerWidth ||
                doc.documentElement.clientWidth || doc.body.clientWidth,
              height: win.innerHeight ||
                doc.documentElement.clientHeight || doc.body.clientHeight
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
          cancelFadeOut: function() {
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
            if (obj == win && obj.doc && obj.location) {
              return 'window';
            } else if (obj == doc) {
              return 'htmldocument';
            } else if (typeof obj === 'string') {
              return 'string';
            } else if (utils.isElement(obj)) {
              return 'element';
            }
          },
          typeOf: function(obj) {
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

        TimePicker.EventDispatcher = function() {};

        TimePicker.EventDispatcher.prototype = {

          constructor: TimePicker.EventDispatcher,

          apply: function(object) {

            object.addEventListener = object.on =
              TimePicker.EventDispatcher.prototype.addEventListener;
            object.hasEventListener =
              TimePicker.EventDispatcher.prototype.hasEventListener;
            object.removeEventListener = object.un =
              TimePicker.EventDispatcher.prototype.removeEventListener;
            object.dispatchEvent = TimePicker.EventDispatcher.prototype.dispatchEvent;

          },

          addEventListener: function(type, listener) {

            if (this._listeners === undefined) this._listeners = {};

            var listeners = this._listeners;

            if (listeners[type] === undefined) {

              listeners[type] = [];

            }

            if (listeners[type].indexOf(listener) === -1) {

              listeners[type].push(listener);

            }

          },

          hasEventListener: function(type, listener) {

            if (this._listeners === undefined) return false;

            var listeners = this._listeners;

            if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {

              return true;

            }

            return false;

          },

          removeEventListener: function(type, listener) {

            if (this._listeners === undefined) return;

            var listeners = this._listeners;
            var listenerArray = listeners[type];

            if (listenerArray !== undefined) {

              var index = listenerArray.indexOf(listener);

              if (index !== -1) {

                listenerArray.splice(index, 1);

              }

            }

          },

          dispatchEvent: function(event) {

            if (this._listeners === undefined) return;

            var listeners = this._listeners;
            var listenerArray = listeners[event.type];

            if (listenerArray !== undefined) {

              event.target = this;

              var array = [];
              var length = listenerArray.length;

              for (var i = 0; i < length; i++) {

                array[i] = listenerArray[i];

              }

              for (i = 0; i < length; i++) {

                array[i].call(this, event);

              }

            }

          }

        };
      })(TimePicker, win, doc);
      return TimePicker;
    })(),
    utils = TimePicker.Utils;

  TimePicker.EventDispatcher.prototype.apply(TimePicker.prototype);

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return TimePicker;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimePicker;
  } else if (typeof this !== 'undefined') {
    this.TimePicker = TimePicker;
  }
}).call(this, window, document);