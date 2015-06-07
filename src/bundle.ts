import log = require('./log');
import manifest = require('./manifest');
import layer = require('./layer');
import fs = require('fs');


export class Bundle {

    name: string = '';

    conf: manifest.IBundleConfig;

    man: manifest.Manifest;

    layers: layer.Collection = new layer.Collection;

    // Output result of the bundle.
    output: string;

    constructor(name: string, man: manifest.Manifest) {
        this.name = name;
        this.man = man;
    }

    setConfig(conf: manifest.IBundleConfig) {
        this.conf = conf;
    }

    build() {
        var self = this;
        log.info('Building bundle: ' + this.name);



        // First go through simple layers.
        this.conf.volumes.forEach((voldef) => {
            var layer_name = voldef[1];
            var mylayer = this.man.layers.getLayer(layer_name);
            if(mylayer instanceof layer.Layer) {
                mylayer.build();
                self.layers.addLayer(mylayer);
            }
        });

        // Now go through simple merge.
        this.conf.volumes.forEach((voldef) => {
            var layer_name = voldef[1];
            var mylayer = this.man.layers.getLayer(layer_name);
            if(mylayer instanceof layer.LayerMerged) {
                self.layers.addLayer(mylayer);
            }
        });

        var bundler = require('./bundle/bundle-browser');
        this.output = bundler(this);
    }

    write() {
        var filename = this.man.destinationFolder + '/' + this.name + '.js';
        fs.writeFileSync(filename, this.output);
    }

}


export class Collection {

    bundles: Bundle[] = [];

    addBundle(bundle: Bundle) {
        this.bundles.push(bundle);
    }

    getBundle(name: string) {
        return this.bundles[name];
    }

}