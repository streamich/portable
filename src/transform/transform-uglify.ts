/// <reference path="../typing.d.ts" />
var uglify = require('uglify-js');


function transform_uglify(file) {
    try {
        file.raw = uglify.minify(file.raw, {
            fromString: true,
            compress: {
                dead_code: true,
            }
        }).code;
    } catch(e) {}
}

export = transform_uglify;