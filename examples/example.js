/* global hljs, TimePicker */

var time2 = document.getElementById('time2');
var timepicker = new TimePicker(['time', 'link'], {
  lang: 'en',
  theme: 'blue-grey'
});
timepicker.on('change', function (evt) {
  var value = (evt.hour || '00') + ':' + (evt.minute || '00');

  if (evt.element.id === 'link') {
    time2.value = value;
  } else {
    evt.element.value = value;
  }
});

hljs.configure({ tabReplace: '  ' });
hljs.initHighlightingOnLoad();
