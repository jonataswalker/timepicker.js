import style from './sass/main.scss';
import { createElement, getMaxZIndex } from './helpers/dom';
import { LANG } from './constants';

const themesMap = {
  dark: style.dark,
};

const createHours = (rowNumber) => {
  const colsNumber = 6;

  let cols = '';

  for (let index = 0; index < colsNumber; index++) {
    const hour = rowNumber * colsNumber + index;

    cols += `<td><a class="${style.hourAnchor}" data-hour="${hour}">${hour}</a></td>`;
  }

  return cols;
};

const createMinutes = (rowNumber) => {
  const colsNumber = 3;
  const step = 5;

  let cols = `<td class="${style.space}"></td>`;

  for (let index = 0; index < colsNumber; index++) {
    const minute = String((rowNumber * colsNumber + index) * step).padStart(2, '0');

    cols += `<td><a class="${style.minuteAnchor}" data-minute="${minute}">${minute}</a></td>`;
  }

  return cols;
};

export function createStructure(picker) {
  const structure = [
    `<table class="${style.table}">`,
    `<thead><tr class="${style.dragTarget}">`,
    `<th colspan="6" class="${style.header}">${LANG[picker.options.lang].hour}</th>`,
    `<th colspan="4" class="${style.header}">${LANG[picker.options.lang].minute}</th>`,
    '</tr></thead>',
    '<tbody>',
    '{{body}}',
    '</tbody>',
    '</table>',
  ];

  const rows = [];

  for (let index = 0; index < 4; index++) {
    const row = `<tr>${createHours(index)}${createMinutes(index)}</tr>`;

    rows.push(row);
  }

  structure[structure.indexOf('{{body}}')] = rows.join('');

  const classname = [style.container, themesMap[picker.options.theme]].join(' ');
  const container = createElement(['div', { id: 'FIXME', classname }], structure.join(''));

  container.style.zIndex = getMaxZIndex() + 10;
  container.style.visibility = 'hidden';
  document.body.append(container);

  return container;
}
