var build = require('../build');
function command_layers(args, options) {
    var manifest = require('../manifest');
    var manifest = manifest.Manifest.readFile(args[0]);
    var layers = build.Builder.buildLayers(manifest);
}
module.exports = command_layers;
