/// <reference path="../typing.d.ts" />
import log = require('../log');
import build = require('../build');
import layer = require('../layer');
import path = require('path');


function command_merge(args, options) {
    var manifest = require('../manifest');
    var manifest = manifest.Manifest.readFile(args[0]);

    build.Builder.mergeLayers(manifest);
}

export = command_merge;