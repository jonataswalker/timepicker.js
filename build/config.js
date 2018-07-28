import { readFileSync } from 'fs';
import { minify } from 'uglify-es';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import bundleSize from 'rollup-plugin-filesize';
import { uglify } from 'rollup-plugin-uglify';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const lintOpts = {
  // extensions: ['js'],
  exclude: ['**/*.json'],
  cache: true,
  throwOnError: true,
};

const banner = readFileSync('build/banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${version}', pkg.version)
  .replace('${time}', new Date());

export default [
  {
    input: './src/base.js',
    output: {
      banner,
      file: './dist/timepicker.min.js',
      format: 'umd',
      name: 'TimePicker',
    },
    plugins: [
      json(),
      eslint(lintOpts),
      bundleSize(),
      resolve({ browser: true }),
      commonjs(),
      buble({ target: { ie: 11 } }),
      uglify({ output: { comments: /^!/ } }, minify),
    ],
  },
  {
    input: './src/base.js',
    output: {
      banner,
      file: './dist/timepicker.js',
      format: 'umd',
      name: 'TimePicker',
    },
    plugins: [
      json(),
      eslint(lintOpts),
      bundleSize(),
      resolve({ browser: true }),
      commonjs(),
      buble({ target: { ie: 11 } }),
    ],
  },
];
