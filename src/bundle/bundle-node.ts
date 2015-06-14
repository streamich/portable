/// <reference path="../typing.d.ts" />
import bundle = require("../bundle");
import fs = require('fs');
import extend = require('../util/extend');
var uglify = require('uglify-js');


var nodefs_js = fs.readFileSync(__dirname + '/../../node_modules/nodefs/nodefs.js').toString();
//var nodefs_js = fs.readFileSync(__dirname + '/../../../nodefs/nodefs.js').toString();
nodefs_js = uglify.minify(nodefs_js, {fromString: true}).code;
var wrap = [
    'var nodefs = (function() {' +
    'var module = {};' +
    'var exports = module.exports = {};',

    '; return module.exports;' +
    '})();',
];

function bundle_node(b: bundle.Bundle, props) {

    var lines = [];
    lines.push(wrap[0] + nodefs_js + wrap[1]);

    lines.push('');
    b.conf.volumes.forEach((volume) => {
        var layer = b.layers.getLayer(volume[1]);
        layer.build();
        var vol_json = JSON.stringify(layer.toJson(), null, 2);
        lines.push('nodefs.volume.mount("' + volume[0] + '", ' + vol_json + ');');
    });

    lines.push('');
    lines.push('require("' + b.conf.props.main + '");');

    return lines.join('\n');
}

export = bundle_node;
