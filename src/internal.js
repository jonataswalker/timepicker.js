(function(TimePicker, win, doc){

  TimePicker.Internal = function(picker){
    this.Picker = picker;
    
    // ready to close when both are chosen
    this.closeWhen = { hour: false, minute: false };
    
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
    show: function(id){
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
    handleOpen: function(id){
      var this_ = this;
      var value;
      var sel_class = TimePicker.constants.selected_class;
      
      utils.removeClass(this.collection.hours, sel_class);
      utils.removeClass(this.collection.minutes, sel_class);
      
      var hour = this.targets[id].hour;
      var minute = this.targets[id].minute;
      if (hour && minute) {
        this.collection.hours.forEach(function(element){
          value = this_.getHour(element);
          if (value == hour) {
            utils.addClass(element, sel_class);
            return;
          }
        });
        
        this.collection.minutes.forEach(function(element){
          value = this_.getMinute(element);
          if (value == minute) {
            utils.addClass(element, sel_class);
            return;
          }
        });
      }
      
      //one-time fire
      doc.addEventListener('mousedown', {
        handleEvent: function (evt) {
          if (TimePicker.elements.container.contains(evt.target)) return;
          if(this_.selecting) this_.hide();
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
    handleClose: function(){
      if (this.closeWhen.hour && this.closeWhen.minute) {
        this.hide();
      }
    },
    getHour: function(element){
      return element.getAttribute(TimePicker.constants.hour_attr);
    },
    getMinute: function(element){
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
      
      this.collection.hours.forEach(function(hour){
        hour.addEventListener('click', selectHour);
      });
      this.collection.minutes.forEach(function(minute){
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
      
      var ar_target = [], element;
      // to array if string
      target = Array.isArray(target) ? target : [target];
      // merge
      Array.prototype.push.apply(ar_target, target);
      
      ar_target.forEach(function(el, i){
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
