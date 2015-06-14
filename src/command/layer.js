var build = require('../build');
var layer = require('../layer');
var manifest = require('../manifest');
function cmd_layer(args, options) {
    var man = manifest.Manifest.readFile(options.file);
    // A list of layers to build.
    var working_set;
    if (!args || !args.length)
        working_set = man.layers;
    else {
        working_set = new layer.Collection;
        args.forEach(function (lname) {
            var mylayer = man.layers.getLayer(lname);
            if (!mylayer)
                throw Error('Layer not defined: ' + lname);
            working_set.addLayer(mylayer);
        });
    }
    var layers = build.Builder.buildLayers(man, working_set);
}
module.exports = cmd_layer;
