/// <reference path="typing.d.ts" />
import manifest = require('./manifest');
import bundle = require('./bundle');
import log = require('./log');
import file = require('./file');
import layer = require('./layer');


export class Builder {

    static buildLayers(man: manifest.Manifest, layers: layer.Collection) {
        if(!layers) layers = man.layers;

        for(var lname in layers.layers) {
            var mylayer = layers.getLayer(lname);
            log.info('Building layer: ' + lname);

            mylayer.build();
            var filepath = mylayer.write(man.destinationFolder);
            log.info('Saving layer: ' + filepath);
        }
    }

    static mergeLayers(man: manifest.Manifest) {

    }

    static buildBundles(man: manifest.Manifest, bundles: bundle.Collection) {
        for(var bname in bundles.bundles) {
            var mybundle = bundles.bundles[bname];
            mybundle.build();
        }
    }

    files: file.Collection;

    watch() {

    }

}