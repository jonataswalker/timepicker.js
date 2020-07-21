/* global TimePicker */

const time2 = document.getElementById('time2');
const timepicker = new TimePicker(['time', 'link'], {
  lang: 'en',
  theme: 'blue-grey',
});

timepicker.on('change', function (evt) {
  const value = `${evt.hour || '00'}:${evt.minute || '00'}`;

  if (evt.element.id === 'link') {
    time2.value = value;
  } else {
    evt.element.value = value;
  }
});
