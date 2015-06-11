/// <reference path="../typing.d.ts" />
var build = require('../build');
var manifest = require('../manifest');
var Config = require('../Config');
function cmd_bundle(args, options) {
    var man = manifest.Manifest.readFile(options.file);
    var bundles = Config.getWorkingBundles(man, args);
    build.Builder.buildBundles(man, bundles);
    for (var bname in bundles.bundles) {
        var mybundle = bundles.bundles[bname];
        mybundle.write();
    }
}
module.exports = cmd_bundle;
