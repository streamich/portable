/// <reference path="../typing.d.ts" />
import bundle = require("../bundle");
import fs = require('fs');
import extend = require('../util/extend');
var zlib = require('zlib');
var uglify = require('uglify-js');


function import_module_code(name, file) {
    var code = fs.readFileSync(file).toString();
    code = uglify.minify(code, {fromString: true}).code;
    return 'var ' + name + ' = (function() {' +
        'var module = {};' +
        'var exports = module.exports = {};' +
        code +
        '; return module.exports;' +
        '})();';
}

var dir_modules = __dirname + '/../../node_modules';
var unionfs_code = import_module_code('unionfs', dir_modules + '/unionfs/index.js');
var memfs_code = import_module_code('memfs', dir_modules + '/memfs/index.js');

function compress(data) {
    return "eval(require('zlib').inflateSync(new Buffer('" + zlib.deflateSync(new Buffer(data)).toString('base64') + "', 'base64')).toString());";
}

function bundle_node(b: bundle.Bundle, props) {

    var lines = [];
    lines.push('var fs = require("fs");');
    lines.push(unionfs_code);
    lines.push(memfs_code);
    lines.push('');
    lines.push('var mem = new memfs.Volume;');

    b.conf.volumes.forEach((volume) => {
        var layer = b.layers.getLayer(volume[1]);
        layer.build();
        var vol_json = JSON.stringify(layer.toJson(), null, 2);
        var mp = volume[0];

        if(mp.substr(0, 2) == './') mp = '__dirname + "' + mp.substr(2) + '"';
        else mp = '"' + mp + '"';
        //mp = '"' + mp + '"';

        lines.push('mem.mountSync(' + mp + ', ' + vol_json + ');');
    });
    lines.push('');

    lines.push('unionfs');
    lines.push('    .use(fs)');
    lines.push('    .use(mem)');
    lines.push('    .replace(fs);');
    lines.push('');

    lines.push('require("' + b.conf.props.main + '");');

    var out = lines.join('\n');
    if(props.compress || (typeof props.compress == 'undefined')) out = compress(out);

    return out;
}

export = bundle_node;
