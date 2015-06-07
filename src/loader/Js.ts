/// <reference path="../typing.d.ts" />
var uglify = require('uglify-js');


class LoaderJs {

    load(file) {
        return uglify.minify(file).code;
    }

}

export = LoaderJs;