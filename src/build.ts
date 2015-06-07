/// <reference path="typing.d.ts" />
import manifest = require('./manifest');
import bundle = require('./bundle');
import log = require('./log');
import file = require('./file');


export class Builder {

    static buildLayers(man: manifest.Manifest) {
        var layer = require('./layer');

        var layers = {};
        for(var name in man.data.layers) {
            log.info('Bulding layer: ' + name);

            var mylayer = layers[name] = new layer.Layer(name);
            mylayer.setConfig(man.data.layers[name]);
            mylayer.addFilesByGlobs();
            var filepath = mylayer.write(man.destinationFolder);

            log.info('Saving layer: ' + filepath);
        }
    }

    static mergeLayers(man: manifest.Manifest) {

    }

    static buildBundles(man: manifest.Manifest) {
        man.bundles.bundles.forEach((bundle: bundle.Bundle) => {
            bundle.build();
            bundle.write();
        });
    }

    files: file.Collection;

    watch() {

    }

}