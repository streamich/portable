/// <reference path="../typing.d.ts" />
import build = require('../build');
import manifest = require('../manifest');
import bundle = require('../bundle');
import Config = require('../Config');


function cmd_bundle(args, options) {

    var man = manifest.Manifest.readFile(options.file);
    var bundles = Config.getWorkingBundles(man, args);
    build.Builder.buildBundles(man, bundles);
    for(var bname in bundles.bundles) {
        var mybundle = bundles.bundles[bname];
        mybundle.write();
    }
}

export = cmd_bundle;
