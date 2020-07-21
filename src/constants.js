export const EVENT_TYPE = {
  open: 'open',
  close: 'close',
  change: 'change',
  startFadeIn: 'start-fade-in',
  endFadeIn: 'end-fade-in',
  startFadeOut: 'start-fade-out',
  endFadeOut: 'end-fade-out',
};

export const DEFAULT_OPTIONS = {
  lang: 'en',
  theme: 'dark',
};

export const FOCUSABLE = /^(?:input|select|textarea|button|object)$/iu;

export const CLICKABLE = /^(?:a|area)$/iu;

export const LANG = {
  en: { hour: 'Hour', minute: 'Minute' },
  pt: { hour: 'Hora', minute: 'Minuto' },
  de: { hour: 'Stunde', minute: 'Minute' },
  es: { hour: 'Hora', minute: 'Minuto' },
  fr: { hour: 'Heure', minute: 'minute' },
  it: { hour: 'Ora', minute: 'minuto' },
  nl: { hour: 'Uur', minute: 'minuut' },
  sv: { hour: 'Timmars', minute: 'minut' },
};
