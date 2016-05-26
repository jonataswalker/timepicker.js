import utils from './utils';
import * as constants from './constants';
import * as vars from '../../config/vars.json';

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
    let hours_html = [], minutes_html = [];
    let minute_zero;
    
    let i = 0, ii, v = 6, u = 0;
    
    /** hours **/
    for (; u < 4; u++) {
      ii = i + v;
      hours_html.push('<ol>');
      for (; i < ii; i++) {
        hours_html.push([
          '<li><a ',
          vars.attr.hour,
          '="',
          i,
          '">',
          i,
          '</a></li>'
        ].join(''));
      }
      hours_html.push('</ol>');
    }
    
    /** minutes **/
    i = 0; ii = 0; v = 15;
    for (u = 0; u < 4; u++) {
      ii = i + v;
      minutes_html.push('<ol>');
      for (; i < ii; i += 5) {
        minute_zero = (i < 10) ? minute_zero = '0' + i : i;
        minutes_html.push([
          '<li><a ',
          vars.attr.minute,
          '="',
          minute_zero,
          '">',
          minute_zero,
          '</a></li>'
        ].join(''));
      }
      minutes_html.push('</ol>');
    }
    
    Html.picker[index_hour] = hours_html.join('');
    Html.picker[index_minute] = minutes_html.join('');
    Html.picker[index_hour_title] = constants.lang[options.lang].hour;
    Html.picker[index_minute_title] = constants.lang[options.lang].minute;

    let container = utils.createElement([
      'div',
      { 
        classname: vars.namespace + vars.container_class + ' ' +
          vars.namespace + '-' + options.theme
      }
    ], Html.picker.join(''));
    
    container.style.zIndex = utils.getMaxZIndex() + 10;
    container.style.visibility = 'hidden';
    document.body.appendChild(container);
    
    const offset = utils.offset(container);
    
    // store element container and dimensions
    this.Base.container = {
      size: {
        width: offset.width,
        height: offset.height
      },
      element: container,
      drag_handle: container.querySelector(`.${vars.namespace+vars.header_class}`)
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
  minute_title: '__minute-title__'
};

Html.picker = [
  `<div class="${vars.namespace+vars.header_class}">`,
    `<div class="${vars.namespace+vars.hour_class}">`,
      Html.replace.hour_title,
    '</div>',
    `<div class="${vars.namespace+vars.minute_class}">`,
      Html.replace.minute_title,
    '</div>',
  '</div>',
  `<div class="${vars.namespace+vars.body_class}">`,
    `<div id="${vars.ids.hour_list}" class="${vars.namespace+vars.hour_class}">`,
      Html.replace.hour_list,
    '</div>',
    `<div id="${vars.ids.minute_list}" class="${vars.namespace+vars.minute_class}">`,
      Html.replace.minute_list,
    '</div>',
  '</div>'
];
