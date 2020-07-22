/* global hljs, TimePicker */

const time2 = document.querySelector('#time2');
const timepicker = new TimePicker('#link', {
  lang: 'en',
  theme: 'dark',
});

timepicker.on('change', function (evt) {
  const value = `${evt.hour || '00'}:${evt.minute || '00'}`;
  time2.value = value;
});

hljs.configure({ tabReplace: '  ' });
hljs.initHighlightingOnLoad();
