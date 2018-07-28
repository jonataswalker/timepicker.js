import * as _VARS from '../config/vars.json';

export const EVENT_TYPE = {
  open: 'open',
  close: 'close',
  change: 'change',
  start_fade_in: 'start-fade-in',
  end_fade_in: 'end-fade-in',
  start_fade_out: 'start-fade-out',
  end_fade_out: 'end-fade-out',
};

export const DEFAULT_OPTIONS = {
  lang: 'en',
  theme: 'dark',
};

export const FOCUSABLE = /^(?:input|select|textarea|button|object)$/i;

export const CLICKABLE = /^(?:a|area)$/i;

export const LANG = {
  en: {
    hour: 'Hour',
    minute: 'Minute',
  },
  pt: {
    hour: 'Hora',
    minute: 'Minuto',
  },
};

export const VARS = _VARS;

/**
 * DOM Elements classname
 */
export const CLASSNAME = {
  container: _VARS.namespace + _VARS.container_class,
  header: _VARS.namespace + _VARS.header_class,
  body: _VARS.namespace + _VARS.body_class,
  hour: _VARS.namespace + _VARS.hour_class,
  minute: _VARS.namespace + _VARS.minute_class,
  selected: _VARS.namespace + _VARS.selected_class,
  dragging: _VARS.namespace + _VARS.dragging_class,
};
