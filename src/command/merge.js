var build = require('../build');
function command_merge(args, options) {
    var manifest = require('../manifest');
    var manifest = manifest.Manifest.readFile(args[0]);
    build.Builder.mergeLayers(manifest);
}
module.exports = command_merge;
