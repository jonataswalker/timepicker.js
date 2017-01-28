var fs = require('fs'),
    minify = require('uglify-js').minify,
    pkg = require('./package.json');

const code = fs.readFileSync('build/timepicker.js', 'utf-8');

const minified = minify(code, {
  fromString: true,
  warnings: false,
  mangle: true,
  output: { comments: /^!/ },
  compress: { screw_ie8: true, drop_console: false }
}).code;

fs.writeFileSync('build/timepicker.min.js', minified);

console.log('Now: ', new Date());
