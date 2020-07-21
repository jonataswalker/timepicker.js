/* global hljs, TimePicker */

const time2 = document.querySelector('#time2');
const timepicker = new TimePicker('#link', {
  lang: 'en',
  theme: 'dark',
});

// timepicker.show();

// console.log(timepicker);

timepicker.on('change', function (evt) {
  console.log('onChange', { evt });

  const value = `${evt.hour || '00'}:${evt.minute || '00'}`;

  if (evt.element.id === 'link') {
    time2.value = value;
  } else {
    evt.element.value = value;
  }
});

hljs.configure({ tabReplace: '  ' });
hljs.initHighlightingOnLoad();
