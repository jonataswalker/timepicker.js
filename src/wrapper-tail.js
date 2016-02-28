    return TimePicker;
  })(),
  utils = TimePicker.Utils;
  
  TimePicker.EventDispatcher.prototype.apply(TimePicker.prototype);
  
  if (typeof define === 'function' && define.amd) {
    define(function () { return TimePicker; });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimePicker;
  } else if (typeof this !== 'undefined') {
    this.TimePicker = TimePicker;
  }
}).call(this, window, document);