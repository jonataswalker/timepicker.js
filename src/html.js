import { createElement, getMaxZIndex, offset } from './helpers/dom';
import { CLASSNAME, VARS, LANG } from './constants';

/**
 * @class Html
 */
export class Html {
  constructor(base) {
    this.Base = base;
  }

  createPicker() {
    const options = this.Base.options;
    const index_hour = Html.picker.indexOf(Html.replace.hour_list);
    const index_minute = Html.picker.indexOf(Html.replace.minute_list);
    const index_hour_title = Html.picker.indexOf(Html.replace.hour_title);
    const index_minute_title = Html.picker.indexOf(Html.replace.minute_title);
    let hours_html = [],
        minutes_html = [];
    let minute_zero;
    let i = 0,
        ii,
        v = 6,
        u = 0;

    /** hours **/
    for (; u < 4; u++) {
      ii = i + v;
      hours_html.push('<ol>');
      for (; i < ii; i++) {
        hours_html.push(
          ['<li><a ', VARS.attr.hour, '="', i, '">', i, '</a></li>'].join(''),
        );
      }
      hours_html.push('</ol>');
    }

    /** minutes **/
    i = 0;
    ii = 0;
    v = 15;
    for (u = 0; u < 4; u++) {
      ii = i + v;
      minutes_html.push('<ol>');
      for (; i < ii; i += 5) {
        minute_zero = i < 10 ? (minute_zero = '0' + i) : i;
        minutes_html.push(
          [
            '<li><a ',
            VARS.attr.minute,
            '="',
            minute_zero,
            '">',
            minute_zero,
            '</a></li>',
          ].join(''),
        );
      }
      minutes_html.push('</ol>');
    }

    Html.picker[index_hour] = hours_html.join('');
    Html.picker[index_minute] = minutes_html.join('');
    Html.picker[index_hour_title] = LANG[options.lang].hour;
    Html.picker[index_minute_title] = LANG[options.lang].minute;

    const ct = `${CLASSNAME.container} ${VARS.namespace}-${options.theme}`;
    const container = createElement(
      ['div', { id: VARS.container_id, classname: ct }],
      Html.picker.join(''),
    );

    container.style.zIndex = getMaxZIndex() + 10;
    container.style.visibility = 'hidden';
    document.body.appendChild(container);

    const _offset_ = offset(container);

    // store element container and dimensions
    this.Base.container = {
      size: {
        width: _offset_.width,
        height: _offset_.height,
      },
      element: container,
      drag_handle: container.querySelector(`.${CLASSNAME.header}`),
    };
    container.style.visibility = '';
    container.style.display = 'none';
    return container;
  }
}

Html.replace = {
  hour_list: '__hour-list__',
  minute_list: '__minute-list__',
  hour_title: '__hour-title__',
  minute_title: '__minute-title__',
};

/* eslint-disable indent */
Html.picker = [
  `<div class="${CLASSNAME.header}">`,
  `<div class="${CLASSNAME.hour}">`,
  Html.replace.hour_title,
  '</div>',
  `<div class="${CLASSNAME.minute}">`,
  Html.replace.minute_title,
  '</div>',
  '</div>',
  `<div class="${CLASSNAME.body}">`,
  `<div id="${VARS.ids.hour_list}" class="${CLASSNAME.hour}">`,
  Html.replace.hour_list,
  '</div>',
  `<div id="${VARS.ids.minute_list}" class="${CLASSNAME.minute}">`,
  Html.replace.minute_list,
  '</div>',
  '</div>',
];
/* eslint-enable indent */
