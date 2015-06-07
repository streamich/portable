/// <reference path="../typing.d.ts" />
import Transform = require('./Transform');
var uglify = require('uglify-js');


class LoaderJs extends Transform {

    process(data: string): string {
        // TODO: Do error checking here.
        return uglify.minify(data, {fromString: true}).code;
    }

}

export = LoaderJs;