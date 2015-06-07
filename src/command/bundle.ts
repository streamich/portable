/// <reference path="../typing.d.ts" />
import build = require('../build');


function cmd_bundle(args, options) {
    var manifest = require('../manifest');
    var man = manifest.Manifest.readFile(args[0]);
    build.Builder.buildBundles(man);
}

export = cmd_bundle;
