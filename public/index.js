/* global hljs, TimePicker */
/* eslint-disable import/unambiguous */
const focusPicker = new TimePicker('#input1');
const triggerPicker = new TimePicker('#link');
const triggerInput = document.getElementById('input2');

window.focusPicker = focusPicker;
window.triggerPicker = triggerPicker;

triggerPicker.on('change', function (evt) {
  triggerInput.value = `${evt.hour || '00'}:${evt.minute || '00'}`;
});

focusPicker.on('change', function (evt) {
  evt.element.value = `${evt.hour || '00'}:${evt.minute || '00'}`;
});

hljs.initHighlightingOnLoad();
