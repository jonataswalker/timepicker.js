import { Html } from './html';
import { Drag } from './drag';
import { Internal } from './internal';
import { Emitter } from './emitter';
import { assert, mergeOptions } from './helpers/mix';
import { isElement, addClass, removeClass } from './helpers/dom';
import { DEFAULT_OPTIONS, VARS } from './constants';

/**
 * Principal class. Will be passed as argument to others.
 * @class Base
 */
export default class Base extends Emitter {
  /**
   * @constructor
   * @param {String|Array<String>|Element|Array<Element>} target String or
   * array of string, DOM node or array of nodes.
   * @param {Object|undefined} opt_options Options.
   */
  constructor(target, opt_options = {}) {
    assert(
      Array.isArray(target) || typeof target === 'string' || isElement(target),
      '`target` should be Element, <Array>Element, String or <Array>String.',
    );

    super();
    this.options = mergeOptions(DEFAULT_OPTIONS, opt_options);
    this.target = target;
    this.container = {};
    const $html = new Html(this);
    const container_el = $html.createPicker();
    const $drag = new Drag(this);
    Base.Internal = new Internal(this);
    Base.Internal.init();

    $drag.when({
      start: () => {
        addClass(container_el, VARS.namespace + VARS.dragging_class);
      },
      move: resp => {
        container_el.style.left = `${resp.x}px`;
        container_el.style.top = `${resp.y}px`;
      },
      end: resp => {
        removeClass(container_el, VARS.namespace + VARS.dragging_class);
        if (resp.y < 0) container_el.style.top = 0;
      },
    });
  }

  show() {
    Base.Internal.show_();
  }

  hide() {
    Base.Internal.hide_();
  }

  setTarget(target) {
    assert(
      Array.isArray(target) || typeof target === 'string' || isElement(target),
      '`target` should be Element, <Array>Element, String or <Array>String.',
    );
    this.target = target;
    Base.Internal.setFocusListener(this.target);
  }
}
