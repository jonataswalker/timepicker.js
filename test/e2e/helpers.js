import { ClientFunction } from 'testcafe';
import TimePicker from '../../';

export function show(id) {
  return ClientFunction(() => {
    return new Promise(resolve => {
      const picker = new TimePicker(id);
      picker.show();
      resolve();
    });
  }, { dependencies: { id } });
}

export function hide(id) {
  return ClientFunction(() => {
    return new Promise(resolve => {
      const picker = new TimePicker(id);
      picker.show();

      window.setTimeout(() => {
        picker.hide();
        resolve();
      }, 200);
    });
  }, { dependencies: { id } });
}
