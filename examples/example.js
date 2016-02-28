hljs.configure({
  tabReplace: '  ',
})
hljs.initHighlightingOnLoad();

var time2 = document.getElementById('time2');

var timepicker = new TimePicker(['time', 'link'], {
  lang: 'pt'
});
timepicker.on('open', function(evt){
  
  console.info('opened');
  console.info(evt);
  
});
timepicker.on('close', function(evt){
  
  console.info('closed');
  console.info(evt);
  
});
timepicker.on('change', function(evt){
  
  console.info('change');
  console.info(evt);
  
  var value = '' + (evt.hour || '00') + ':' + (evt.minute || '00');
  
  if (evt.element.id == 'link') {
    time2.value = value;
  } else {
    evt.element.value = value;
  }
});