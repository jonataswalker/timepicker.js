import * as vars from '../../sass-vars.json';
import * as constants from './constants';
import utils from './utils';

/**
 * @class Internal
 */
export class Internal {
  constructor(base) {
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
  }
  
  init() {
    this.setFocusListener(this.Base.target);
    this.setSelectListener();
  }

  show(id) {
    const target = this.targets[id].element;
    const target_offset = utils.offset(target);
    const container_offset = this.Base.container.size;
    const top = target_offset.top + target_offset.height + 5;
    const window_ = utils.getWindowSize();
    
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
    
    this.events.subscribe(constants.eventType.start_fade_in, obj => {
      obj.target.style.opacity = 0;
      obj.target.style.display = 'block';
    });
    
    this.request_ani_id = utils.fade(this.events, this.container, 400);
    
    this.Base.dispatchEvent(constants.eventType.open, {
      element: target
    });
    
    this.handleOpen(id);
  }

  hide() {
    this.opened = false;
    
    this.events.subscribe(constants.eventType.start_fade_out, obj => {
      obj.target.style.opacity = 1;
      obj.target.style.display = 'block';
    });
    
    this.events.subscribe(constants.eventType.end_fade_out, obj => {
      obj.target.style.display = 'none';
    });
    
    this.request_ani_id = utils.fade(this.events, this.container, 800, 'out');
    
    this.Base.dispatchEvent(constants.eventType.close, {
      element: this.targets[this.id_active].element
    });
  }

  handleOpen(id) {
    const this_ = this;
    const sel_class = vars.namespace + vars.selected_class;
    const hour = this.targets[id].hour;
    const minute = this.targets[id].minute;
    let value;
    
    utils.removeClass(this.collection.hours, sel_class);
    utils.removeClass(this.collection.minutes, sel_class);
    
    if (hour && minute) {
      this.collection.hours.forEach(element => {
        value = this.getHour(element);
        if (value == hour) {
          utils.addClass(element, sel_class);
          return;
        }
      });
      
      this.collection.minutes.forEach(element => {
        value = this.getMinute(element);
        if (value == minute) {
          utils.addClass(element, sel_class);
          return;
        }
      });
    }
    
    //one-time fire
    document.addEventListener('mousedown', {
      handleEvent: function (evt) {
        // click inside Picker
        if (this_.container.contains(evt.target)) {
          return;
        }
        
        let is_clicking_target = false;
        this_.targets.forEach(target => {
          if (target.element == evt.target) {
            is_clicking_target = true;
          }
        });
        
        if (!is_clicking_target && this_.opened) {
          this_.hide();
        }
        
        if (this_.targets[id].element != evt.target) {
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
  }

  handleClose() {
    if (this.closeWhen.hour && this.closeWhen.minute) {
      this.hide();
    }
  }

  getHour(element) {
    return element.getAttribute(vars.attr.hour);
  }

  getMinute(element) {
    return element.getAttribute(vars.attr.minute);
  }

  setSelectListener() {
    const hour_list = utils.$(vars.ids.hour_list);
    const minute_list = utils.$(vars.ids.minute_list);
    const sel_class = vars.namespace + vars.selected_class;
    
    this.collection.hours = utils.getAllChildren(hour_list, 'a');
    this.collection.minutes = utils.getAllChildren(minute_list, 'a');
    
    const selectHour = evt => {
      evt.preventDefault();
      const active = this.targets[this.id_active];
      
      active.hour = this.getHour(evt.target);
      this.Base.dispatchEvent(constants.eventType.change, {
        element: active.element,
        hour: active.hour,
        minute: active.minute
      });
      
      utils.removeClass(this.collection.hours, sel_class);
      utils.addClass(evt.target, sel_class);
      this.closeWhen.hour = true;
      this.handleClose();
    };
    const selectMinute = evt => {
      evt.preventDefault();
      const active = this.targets[this.id_active];
      
      active.minute = this.getMinute(evt.target);
      this.Base.dispatchEvent(constants.eventType.change, {
        element: active.element,
        hour: active.hour,
        minute: active.minute
      });
      
      utils.removeClass(this.collection.minutes, sel_class);
      utils.addClass(evt.target, sel_class);
      this.closeWhen.minute = true;
      this.handleClose();
    };
    
    this.collection.hours.forEach(hour => {
      hour.addEventListener('click', selectHour);
    });
    this.collection.minutes.forEach(minute => {
      minute.addEventListener('click', selectMinute);
    });
  }

  setFocusListener(target) {
    const triggerShow = evt => {
      evt.preventDefault();
      window.cancelAnimationFrame(this.request_ani_id);
      this.show(evt.target._id);
    };
    
    let ar_target = [], element;
    // to array if string
    target = Array.isArray(target) ? target : [target];
    // merge
    Array.prototype.push.apply(ar_target, target);
    
    ar_target.forEach(el => {
      element = utils.evaluate(el);
      
      if (!element) return;

      let id = this._ids++;
      element._id = id;
      this.targets[id] = {
        element: element
      };

      if (utils.focusable.test(element.nodeName)) {
        element.addEventListener('focus', triggerShow, true);
      } else if (utils.clickable.test(element.nodeName)) {
        element.addEventListener('click', triggerShow, true);
      }
    });
  }
}
