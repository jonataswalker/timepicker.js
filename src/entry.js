import base from './base.js';

export default function (target, initOptions) {
  const { initialize, show, hide, emitter, setTarget, picker } = base(target, initOptions);

  initialize();

  return { show, hide, setTarget, on: emitter.on, container: picker.container.element };
}
