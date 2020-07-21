import Base from './base.js';

export default function (target, initOptions) {
  const { initialize, show, emitter } = Base(target, initOptions);

  initialize();

  return { show, on: emitter.on };
}
