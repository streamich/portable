/// <reference path="../typing.d.ts" />
var uglify = require('uglify-js');
function transform_uglify(file) {
    file.raw = uglify.minify(file.raw, {
        fromString: true,
        compress: {
            dead_code: true
        }
    }).code;
}
module.exports = transform_uglify;
