var require = patchRequire(require),
    vars = require('../sass-vars.json'),
    port = 8888;

exports.vars = vars;

exports.port = port;

exports.url = 'http://127.0.0.1:' + port + '/test/test.html';