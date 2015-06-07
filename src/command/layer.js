var build = require('../build');
function cmd_layer(args, options) {
    var manifest = require('../manifest');
    var manifest = manifest.Manifest.readFile(args[0]);
    var layers = build.Builder.buildLayers(manifest);
}
module.exports = cmd_layer;
