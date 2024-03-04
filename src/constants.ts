import type { Language, Options } from './types'

export const DEFAULT_OPTIONS: Options = {
    lang: 'en',
    theme: 'dark',
}

export const FOCUSABLE = /^(?:input|select|textarea|button|object)$/iu

export const CLICKABLE = /^(?:a|area)$/iu

export const LANG: Language = {
    en: { hour: 'Hour', minute: 'Minute' },
    pt: { hour: 'Hora', minute: 'Minuto' },
    de: { hour: 'Stunde', minute: 'Minute' },
    es: { hour: 'Hora', minute: 'Minuto' },
    fr: { hour: 'Heure', minute: 'minute' },
    it: { hour: 'Ora', minute: 'minuto' },
    nl: { hour: 'Uur', minute: 'minuut' },
    sv: { hour: 'Timmars', minute: 'minut' },
}
