import type Timepicker from '../src/main'

export {}

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            toHaveBeenCalledWith(...params: unknown): R
            toHaveBeenCalled(): R
        }
    }
    interface Window {
        testingPurposes: {
            picker: Timepicker
            eventsCalled: string[]
            chosen: { hour: string, minute: string }
        }
    }
}
