/// <reference path="./typing.d.ts" />
var Layer = require('./Layer');
var path = require('path');
var mkdir = require('./util/mkdir');
function build_layers(config, args, options, cmd) {
    var logger = console.log.bind(console);
    var dest = path.resolve("" + (config.dest ? config.dest : "./")) + "/";
    mkdir(dest);
    var layers = {};
    for (var name in config.layers) {
        logger('Bulding layer: ' + name);
        var lconf = config.layers[name];
        var layer = layers[name] = new Layer(lconf.base ? lconf.base : '');
        if (!(lconf.globs instanceof Array) || (!lconf.globs.length))
            throw Error('No layer globs defined for layer: ' + name);
        layer.addByGlobs(lconf.glob);
        var layerfile = dest + name + '.nodefs.json';
        var size = layer.write(layerfile);
        logger('Saving layer: ' + layerfile);
        logger('Size: ' + size);
        logger('\n');
    }
    return layers;
}
module.exports = build_layers;
