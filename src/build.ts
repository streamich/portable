/// <reference path="typing.d.ts" />
import man = require('./manifest');
import log = require('./log');


export class Builder {

    static buildLayers(manifest: man.Manifest) {
        var layer = require('./layer');

        var layers = {};
        for(var name in manifest.data.layers) {
            log.info('Bulding layer: ' + name);

            var mylayer = layers[name] = new layer.Layer(name);
            mylayer.setConfig(manifest.data.layers[name]);
            mylayer.addFilesByGlobs();
            var filepath = mylayer.write(manifest.destinationFolder);

            log.info('Saving layer: ' + filepath);
        }
    }

    static mergeLayers(manifest: man.Manifest) {

    }

}