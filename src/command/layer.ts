/// <reference path="../typing.d.ts" />
import log = require('../log');
import build = require('../build');
import layer = require('../layer');
import manifest = require('../manifest');
import path = require('path');
import mkdir = require('../util/mkdir');


function cmd_layer(args, options) {

    var man = manifest.Manifest.readFile(options.file);

    // A list of layers to build.
    var working_set;
    if(!args || !args.length) working_set = man.layers;
    else {
        working_set = new layer.Collection;
        args.forEach((lname) => {
            console.log(lname);
            var mylayer = man.layers.getLayer(lname);
            if(!mylayer) throw Error('Layer not defined: ' + lname);
            working_set.addLayer(mylayer);
        });
    }

    var layers = build.Builder.buildLayers(man, working_set);

}

export = cmd_layer;
