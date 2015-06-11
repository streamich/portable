/// <reference path="../typing.d.ts" />
import bundle = require("../bundle");
import fs = require('fs');
import extend = require('../util/extend');


var lib_json = fs.readFileSync(__dirname + '/../../build/libmin.json').toString();
var lib = JSON.parse(lib_json);


function bundle_browser(b: bundle.Bundle, props) {

    var volumes = {
        '/lib': lib,
    };

    b.conf.volumes.forEach((volume) => {
        volumes[volume[0]] = b.layers.getLayer(volume[1]).toJson();
    });

    var env = {
        PWD: '/usr',
    };
    if(props.env) {
        env = extend(env, props.env);
    }

    var process = {
        expose: true,
        platform: 'browser',
        env: env,
        argv: props.argv ? props.argv : ['/usr/index.js'],
        drives: volumes
    };

    var lines = [];
    lines.push('(function(process) { eval(process.drives["/lib"]["portable.js"])(process); })(' +
        JSON.stringify(process, null, 4) + ');\n');
    var out = lines.join('');

    return out;
}

export = bundle_browser;