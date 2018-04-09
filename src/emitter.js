/**
 * Based on https://github.com/metafizzy/ev-emitter
 * @class Emitter
 */
export class Emitter {
  /**
   * @constructor
   */
  constructor() {
    // set events hash
    this._events = this._events || {};
    // set onceEvents hash
    this._onceEvents = this._onceEvents || {};
  }

  on(eventName, listener) {
    if (!eventName || !listener) return;
    // set listeners array
    let listeners = this._events[eventName] = this._events[eventName] || [];
    // only add once
    if (listeners.indexOf(listener) === -1) listeners.push(listener);
    return this;
  }

  once(eventName, listener) {
    if (!eventName || !listener) return;
    // add event
    this.on(eventName, listener);
    // set onceListeners object
    let onceListeners =
      this._onceEvents[eventName] =
        this._onceEvents[eventName] || {};
    // set flag
    onceListeners[listener] = true;
    return this;
  }
  off(eventName, listener) {
    let listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) return;
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
    return this;
  }

  dispatchEvent(eventName, obj = {}) {
    let listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) return;

    let i = 0;
    let listener = listeners[i];
    // once stuff
    const onceListeners = this._onceEvents && this._onceEvents[eventName];

    while (listener) {
      let isOnce = onceListeners && onceListeners[listener];
      if (isOnce) {
        // remove listener
        // remove before trigger to prevent recursion
        this.off(eventName, listener);
        // unset once flag
        delete onceListeners[listener];
      }
      // trigger listener
      listener.call(this, obj);
      // get next listener
      i += isOnce ? 0 : 1;
      listener = listeners[i];
    }
    return this;
  }
}
