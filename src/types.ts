export type AvailableThemes =
    | 'dark'
    | 'red'
    | 'pink'
    | 'purple'
    | 'deep-purple'
    | 'indigo'
    | 'blue'
    | 'light-blue'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'light-green'
    | 'lime'
    | 'yellow'
    | 'amber'
    | 'orange'
    | 'deep-orange'
    | 'brown'
    | 'blue-grey'

export type AvailableLanguages = 'en' | 'pt' | 'de' | 'es' | 'fr' | 'it' | 'nl' | 'sv'

export const enum Events {
    OPEN = 'open',
    CLOSE = 'close',
    CHANGE = 'change',
    START_FADE_IN = 'start-fade-in',
    END_FADE_IN = 'end-fade-in',
    START_FADE_OUT = 'start-fade-out',
    END_FADE_OUT = 'end-fade-out',
}

export type EmitterEvents = {
    [Events.START_FADE_IN]: Picker['target']['element']
    [Events.START_FADE_OUT]: Picker['target']['element']
    [Events.END_FADE_IN]: Picker['target']['element']
    [Events.END_FADE_OUT]: Picker['target']['element']
}

export type EmitterClientEvents = {
    [Events.OPEN]: { element: Picker['target']['element'] }
    [Events.CLOSE]: { element: Picker['target']['element'] }
    [Events.CHANGE]: {
        hour: Picker['hour']
        minute: Picker['minute']
        element: Picker['target']['element']
    }
}

export type Language = Record<AvailableLanguages, { hour: string, minute: string }>

export type Options = {
    lang: AvailableLanguages
    theme: AvailableThemes
}

export type Picker = {
    options: Options
    target: {
        element: HTMLElement
        offset: {
            width: number
            height: number
            top: number
            bottom: number
            right: number
            left: number
        }
    }
    hour: string
    minute: string
    opened: boolean
    requestAnimationId: number
    closeWhen: { hour: boolean, minute: boolean }
    collection: { hours: NodeListOf<HTMLAnchorElement>, minutes: NodeListOf<HTMLAnchorElement> }

    container: {
        element: HTMLElement
        dragElement: HTMLElement
        lastX: number
        lastY: number
        currentX: number
        currentY: number
        x: number
        y: number
        size: { width: number, height: number }
    }
}

export type PickerDragHandler = {
    start: () => void
    move: ({ x, y }: { x: number, y: number }) => void
    end: ({ x, y }: { x: number, y: number }) => void
}
