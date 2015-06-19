import log = require('./log');
import manifest = require('./manifest');
import layer = require('./layer');
import fs = require('fs');
import events = require('events');


export class Bundle extends events.EventEmitter {

    name: string = '';

    conf: manifest.IBundleConfig;

    man: manifest.Manifest;

    layers: layer.Collection = new layer.Collection;

    // Output result of the bundle.
    output: string = '';

    // File extension
    extension: string = 'js';

    mimeType: string = 'application/javascript';

    defaultBundler = 'browser';

    constructor(name: string, man: manifest.Manifest) {
        super();
        this.name = name;
        this.man = man;
    }

    validate(conf: manifest.IBundleConfig) {
        if(!conf.volumes || !(conf.volumes instanceof Array) || !(conf.volumes.length)) {
            throw Error('Bundle "' + this.name + '" volumes not defined.');
        }
    }

    setConfig(conf: manifest.IBundleConfig) {
        this.validate(conf);
        var self = this;
        if(!conf.target) conf.target = this.defaultBundler;
        if(!conf.props) conf.props = {};
        this.conf = conf;

        if(!(conf.volumes[0] instanceof Array)) conf.volumes = <any[]> [conf.volumes];

        this.conf.volumes.forEach((voldef) => {
            var layer_name = voldef[1];
            this.layers.addLayer(this.man.layers.getLayer(layer_name));
        });
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

        // Now go through merge layers.
        this.conf.volumes.forEach((voldef) => {
            var layer_name = voldef[1];
            var mylayer = this.man.layers.getLayer(layer_name);
            if(mylayer instanceof layer.LayerMerged) {
                self.layers.addLayer(mylayer);
            }
        });

        this.bundle();
    }

    getBundlerFunction(name: string) {
        try {
            return require('../../portable-bundle-' + name + '/index.js');
        } catch(e) {
            try {
                return require('portable-bundle-' + name);
            } catch(e) {
                try {
                    return require(name);
                } catch(e) {
                    throw Error('Bundle "' + this.name + '" could not find bundler: ' + name);
                }
            }
        }
    }

    bundle() {
        var bundler_name = this.conf.target ? this.conf.target : this.defaultBundler;
        var bundler = this.getBundlerFunction(bundler_name);
        this.output = bundler(this, this.conf.props);
    }

    write() {
        var filename = this.man.destinationFolder + '/' + this.name + '.js';
        fs.writeFileSync(filename, this.output);
    }

    watch() {
        for(var lname in this.layers.layers) {
            var mylayer = this.layers.getLayer(lname);
            mylayer.watch();
            mylayer.on('file:new', function(myfile) {
                this.emit('file:new', myfile, mylayer);
                this.bundle();
            }.bind(this));
            mylayer.on('file:change', function(myfile) {
                this.emit('file:change', myfile, mylayer);
                this.bundle();
            }.bind(this));
            mylayer.on('file:delete', function(myfile) {
                this.emit('file:delete', myfile, mylayer);
                this.bundle();
            }.bind(this));
        }
    }

}


export class Collection {

    bundles: {[s: string]: Bundle} = {};

    addBundle(bundle: Bundle) {
        this.bundles[bundle.name] = bundle;
    }

    getBundle(name: string) {
        return this.bundles[name];
    }

}