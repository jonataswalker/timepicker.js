import { CLASSNAME, VARS, EVENT_TYPE, FOCUSABLE, CLICKABLE } from './constants';
import {
  offset,
  getWindowSize,
  addClass,
  removeClass,
  getAllChildren,
  evaluate,
  $,
} from './helpers/dom';
import { pubSub, fade } from './helpers/mix';

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
    this.collection = { hours: [], minutes: [] };

    this.pubSub = pubSub();

    this.request_ani_id = undefined;
  }

  init() {
    this.setFocusListener(this.Base.target);
    this.setSelectListener();
  }

  show(id) {
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

    this.pubSub.subscribe(EVENT_TYPE.start_fade_in, obj => {
      obj.target.style.opacity = 0;
      obj.target.style.display = 'block';
    });

    this.request_ani_id = fade(this.pubSub, this.container, 400);
    this.Base.dispatchEvent(EVENT_TYPE.open, { element: target });
    this.handleOpen(id);
  }

  show_() {
    this.targets.forEach(each => this.show(each.element._id));
  }

  hide(id) {
    this.opened = false;
    this.pubSub.subscribe(EVENT_TYPE.start_fade_out, obj => {
      obj.target.style.opacity = 1;
      obj.target.style.display = 'block';
    });
    this.pubSub.subscribe(EVENT_TYPE.end_fade_out, obj => {
      obj.target.style.display = 'none';
    });
    this.request_ani_id = fade(this.pubSub, this.container, 800, 'out');
    this.Base.dispatchEvent(EVENT_TYPE.close, {
      element: this.targets[id].element,
    });
  }

  hide_() {
    this.targets.forEach(each => this.hide(each.element._id));
  }

  handleOpen(id) {
    const this_ = this;
    const hour = this.targets[id].hour;
    const minute = this.targets[id].minute;
    let value;

    removeClass(this.collection.hours, CLASSNAME.selected);
    removeClass(this.collection.minutes, CLASSNAME.selected);

    if (hour && minute) {
      this.collection.hours.forEach(element => {
        value = this.getHour(element);
        if (value === hour) {
          addClass(element, CLASSNAME.selected);
          return;
        }
      });
      this.collection.minutes.forEach(element => {
        value = this.getMinute(element);
        if (value === minute) {
          addClass(element, CLASSNAME.selected);
          return;
        }
      });
    }

    //one-time fire
    document.addEventListener(
      'mousedown',
      {
        handleEvent: function (evt) {
          // click inside Picker
          if (this_.container.contains(evt.target)) return;

          let is_clicking_target = false;
          this_.targets.forEach(target => {
            if (target.element === evt.target) is_clicking_target = true;
          });

          if (!is_clicking_target && this_.opened) this_.hide(id);

          if (this_.targets[id].element !== evt.target) {
            document.removeEventListener(evt.type, this, false);
          }
        },
      },
      false,
    );

    this.opened = true;
    this.id_active = id;
    this.closeWhen = { hour: false, minute: false };
  }

  handleClose(id) {
    if (this.closeWhen.hour && this.closeWhen.minute) this.hide(id);
  }

  getHour(element) {
    return element.getAttribute(VARS.attr.hour);
  }

  getMinute(element) {
    return element.getAttribute(VARS.attr.minute);
  }

  setSelectListener() {
    const hour_list = $(VARS.ids.hour_list);
    const minute_list = $(VARS.ids.minute_list);
    const selectHour = evt => {
      evt.preventDefault();
      const active = this.targets[this.id_active];

      active.hour = this.getHour(evt.target);
      this.Base.dispatchEvent(EVENT_TYPE.change, {
        element: active.element,
        hour: active.hour,
        minute: active.minute,
      });

      removeClass(this.collection.hours, CLASSNAME.selected);
      addClass(evt.target, CLASSNAME.selected);
      this.closeWhen.hour = true;
      this.handleClose(this.id_active);
    };
    const selectMinute = evt => {
      evt.preventDefault();
      const active = this.targets[this.id_active];

      active.minute = this.getMinute(evt.target);
      this.Base.dispatchEvent(EVENT_TYPE.change, {
        element: active.element,
        hour: active.hour,
        minute: active.minute,
      });

      removeClass(this.collection.minutes, CLASSNAME.selected);
      addClass(evt.target, CLASSNAME.selected);
      this.closeWhen.minute = true;
      this.handleClose(this.id_active);
    };

    this.collection.hours = getAllChildren(hour_list, 'a');
    this.collection.minutes = getAllChildren(minute_list, 'a');

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

    let ar_target = [],
        element;
    // to array if string
    target = Array.isArray(target) ? target : [target];
    // merge
    Array.prototype.push.apply(ar_target, target);

    ar_target.forEach(el => {
      element = evaluate(el);
      if (!element) return;

      let id = this._ids++;
      element._id = id;
      this.targets[id] = { element: element };

      if (FOCUSABLE.test(element.nodeName)) {
        element.addEventListener('focus', triggerShow, true);
      } else if (CLICKABLE.test(element.nodeName)) {
        element.addEventListener('click', triggerShow, true);
      }
    });
  }
}
