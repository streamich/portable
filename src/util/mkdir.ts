/// <reference path="../typing.d.ts" />
import fs = require('fs');
import path = require('path');


/**
 * Create recursively directories.
 */
function mkdir(dir, mode?) {
    if(fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return;

    var parts = path.normalize(dir).split(path.sep);
    mode = mode || process.umask();

    var create = function(dir, mode) {
        if(!fs.existsSync(dir)) fs.mkdirSync(dir, mode);
        if(!fs.statSync(dir).isDirectory()) throw Error('Expected directory:' + dir);
    };

    var prefix = parts[0]; // `c:` on Windows.
    for(var i = 1; i < parts.length; i++) {
        prefix += path.sep + parts[i];
        create(prefix, mode);
    }
}

export = mkdir;