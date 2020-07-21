import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import jetpack from 'fs-jetpack';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

const filename = fileURLToPath(import.meta.url);
const resolvePath = (file) => resolve(dirname(filename), file);
const pkg = JSON.parse(readFileSync(resolvePath('../package.json')));

export function createOnWarn(subscriber) {
  return (warning) => {
    // skip certain warnings
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

    if (warning.code === 'NON_EXISTENT_EXPORT') {
      subscriber.error(warning.message);

      return;
    }

    subscriber.next({ status: 'warn', message: warning.message });
  };
}

export function getInputOptions(minify = true) {
  const plugins = [
    postcss({ minimize: true, modules: true }),
    buble({ objectAssign: true }),
    minify && terser({ output: { comments: /^!/u } }),
  ];

  return { input: resolvePath('../src/entry.js'), plugins };
}

export function getOutputOptions(minify = true) {
  jetpack.dir(resolvePath('../dist'));

  const file = minify
    ? resolvePath('../dist/timepicker.min.js')
    : resolvePath('../dist/timepicker.js');
  const banner = `
    /*!
    * ${pkg.name} - v${pkg.version}
    * Built: ${new Date()}
    */
  `;

  return { banner, file, format: 'umd', name: 'TimePicker' };
}
