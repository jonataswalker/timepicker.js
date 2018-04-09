import { show, hide } from './helpers';
// import { Selector } from 'testcafe';

import Page from './page';

const page = new Page();

fixture `Timepicker`
  .page `./pages/picker.html`;

test('Open on focus', async t => {
  await t
    .click(page.inputFocus)
    .expect(page.pickerContainer.exists).ok();
});

test('Open on click', async t => {
  await t
    .click(page.trigger)
    .expect(page.pickerContainer.exists).ok();
});

test('Show programatically', async t => {
  await show('time');
  await t
    .expect(page.pickerContainer.exists).ok();
});

test('Hide programatically', async t => {
  await hide('time');
  await t
    .expect(page.pickerContainer.visible).notOk();
});

test('Set time properly', async t => {
  const chosen = { h: '10', m: '30' };
  const hour_el = page.hourContainer
    .find('a')
    .withAttribute(page.vars.attr.hour, chosen.h);
  const minute_el = page.minuteContainer
    .find('a')
    .withAttribute(page.vars.attr.minute, chosen.m);

  await t
    .click(page.inputFocus)
    .wait(100)
    .click(hour_el)
    .expect(page.inputFocus.value).eql(`${chosen.h}:00`)
    .wait(100)
    .click(minute_el)
    .expect(page.inputFocus.value).eql(`${chosen.h}:${chosen.m}`);
});
