import { Html } from './html';
import { Drag } from './drag';
import { Internal } from './internal';
import { Emitter } from './emitter';
import utils from './utils';
import * as constants from './constants';
import * as vars from '../../config/vars.json';

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
    utils.assert(Array.isArray(target)
        || utils.typeOf(target) === 'string'
        || utils.isElement(target),
        '`target` should be Element, <Array>Element, String or <Array>String.'
    );
    super();
    this.options = utils.mergeOptions(constants.defaultOptions, opt_options);
    this.target = target;
    this.container = {};
    const $html = new Html(this);
    const container_el = $html.createPicker();
    const $drag = new Drag(this);
    Base.Internal = new Internal(this);
    Base.Internal.init();

    $drag.when({
      start: () => {
        utils.addClass(container_el, vars.namespace + vars.dragging_class);
      },
      move: resp => {
        container_el.style.left = `${resp.x}px`;
        container_el.style.top = `${resp.y}px`;
      },
      end: resp => {
        utils.removeClass(container_el, vars.namespace + vars.dragging_class);
        if (resp.y < 0) container_el.style.top = 0;
      }
    });
  }

  show() {
    Base.Internal.show_();
  }

  hide() {
    Base.Internal.hide_();
  }

  setTarget(target) {
    utils.assert(Array.isArray(target)
        || utils.typeOf(target) === 'string'
        || utils.isElement(target),
        '`target` should be Element, <Array>Element, String or <Array>String.'
    );
    this.target = target;
    Base.Internal.setFocusListener(this.target);
  }
}
