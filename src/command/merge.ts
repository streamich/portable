/// <reference path="../typing.d.ts" />
import log = require('../log');
import build = require('../build');
import layer = require('../layer');
import path = require('path');


function cmd_merge(args, options) {
    var manifest = require('../manifest');
    var manifest = manifest.Manifest.readFile(args[0]);

    build.Builder.mergeLayers(manifest);
}

export = cmd_merge;