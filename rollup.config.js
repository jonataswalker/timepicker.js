import { readFileSync } from 'fs';
import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

const banner = readFileSync('banner.js', 'utf-8')
    .replace('${name}', pkg.name)
    .replace('${version}', pkg.version)
    .replace('${description}', pkg.description)
    .replace('${homepage}', pkg.homepage)
    .replace('${time}', new Date());

export default {
  banner,
  format: 'umd',
  entry: 'src/js/base.js',
  dest: 'build/timepicker.js',
  moduleName: 'TimePicker',
  plugins: [json(), buble({ target: { ie: 9 } })]
};
