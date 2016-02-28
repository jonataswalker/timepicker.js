(function(TimePicker, win, doc){

  TimePicker.Html = function(picker){
    this.Picker = picker;
  };
  TimePicker.Html.prototype = {
    createPicker: function(){
      var options = this.Picker.options;
      var constants = TimePicker.constants;
      var replace = TimePicker.Html.replace;
      var html = TimePicker.Html.picker;
      var index_hour = html.indexOf(replace.hour_list);
      var index_minute = html.indexOf(replace.minute_list);
      var index_hour_title = html.indexOf(replace.hour_title);
      var index_minute_title = html.indexOf(replace.minute_title);
      var hours_html = [], minutes_html = [];
      var minute_zero;
      
      var i = 0, ii, v = 6;
      
      /** hours **/
      for (var u = 0; u < 4; u++) {
        ii = i + v;
        hours_html.push('<ol>');
        for (; i < ii; i++) {
          hours_html.push('<li><a href="javascript:void(0)" '+ constants.hour_attr +
            '="'+ i +'">'+ i +'</a></li>');
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
          minutes_html.push('<li><a href="javascript:void(0)" '+ 
            constants.minute_attr +'="'+ minute_zero +'">'+ minute_zero +'</a></li>');
        }
        minutes_html.push('</ol>');
      }
      
      html[index_hour] = hours_html.join('');
      html[index_minute] = minutes_html.join('');
      html[index_hour_title] = TimePicker.lang[options.lang].hour;
      html[index_minute_title] = TimePicker.lang[options.lang].minute;
      

      var container = utils.createElement([
        'div', { classname: constants.container_class }
      ], html.join(''));
      
      container.style.zIndex = utils.getMaxZIndex() + 10;
      container.style.display = 'none';
      doc.body.appendChild(container);
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
    '<div class="'+ TimePicker.constants.header_class +' _jw-timepicker-clearfix">',
      '<div class="_jw-timepicker-hour">',
        TimePicker.Html.replace.hour_title,
      '</div>',
      '<div class="_jw-timepicker-minute">',
        TimePicker.Html.replace.minute_title,
      '</div>',
    '</div>',
    '<div class="_jw-timepicker-body _jw-timepicker-clearfix">',
      '<div id="'+ TimePicker.constants.hour_list_id +'" class="_jw-timepicker-hour">',
        TimePicker.Html.replace.hour_list,
      '</div>',
      '<div id="'+ TimePicker.constants.minute_list_id +'" class="_jw-timepicker-minute">',
        TimePicker.Html.replace.minute_list,
      '</div>',
    '</div>'
  ];
})(TimePicker, win, doc);
