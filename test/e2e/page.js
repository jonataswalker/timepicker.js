import { Selector } from 'testcafe';
import { VARS } from '../../src/constants';

export default class Page {
  constructor(control) {
    this.pickerContainer = Selector(`#${VARS.container_id}`);
    this.inputFocus = Selector('#time');
    this.trigger = Selector('#link');
    this.vars = VARS;
    this.hourContainer = Selector(`#${VARS.ids.hour_list}`);
    this.minuteContainer = Selector(`#${VARS.ids.minute_list}`);
  }
}
