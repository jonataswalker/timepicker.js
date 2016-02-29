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
    width: 0, height: 0
  };
  
  var $html = new TimePicker.Html(this);
  var container = $html.createPicker();
  var $drag = new TimePicker.Drag();
  _TimePicker = new TimePicker.Internal(this);
  
  $drag.when({
    start: function(){
      container.style.opacity = '';
      utils.addClass(container, 'dragging');
    },
    move: function(){
      container.style.left = this.x + 'px';
      container.style.top = this.y + 'px';
    },
    end: function(){
      utils.removeClass(container, 'dragging');
      if(this.y < 0) container.style.top = 0;
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
