var log = require('./log');
var layer = require('./layer');
var fs = require('fs');
var Bundle = (function () {
    function Bundle(name, man) {
        this.name = '';
        this.layers = new layer.Collection;
        this.name = name;
        this.man = man;
    }
    Bundle.prototype.setConfig = function (conf) {
        this.conf = conf;
    };
    Bundle.prototype.build = function () {
        var _this = this;
        var self = this;
        log.info('Building bundle: ' + this.name);
        // First go through simple layers.
        this.conf.volumes.forEach(function (voldef) {
            var layer_name = voldef[1];
            var mylayer = _this.man.layers.getLayer(layer_name);
            if (mylayer instanceof layer.Layer) {
                mylayer.build();
                self.layers.addLayer(mylayer);
            }
        });
        // Now go through simple merge.
        this.conf.volumes.forEach(function (voldef) {
            var layer_name = voldef[1];
            var mylayer = _this.man.layers.getLayer(layer_name);
            if (mylayer instanceof layer.LayerMerged) {
                self.layers.addLayer(mylayer);
            }
        });
        var bundler = require('./bundle/bundle-browser');
        this.output = bundler(this);
    };
    Bundle.prototype.write = function () {
        var filename = this.man.destinationFolder + '/' + this.name + '.js';
        fs.writeFileSync(filename, this.output);
    };
    return Bundle;
})();
exports.Bundle = Bundle;
var Collection = (function () {
    function Collection() {
        this.bundles = [];
    }
    Collection.prototype.addBundle = function (bundle) {
        this.bundles.push(bundle);
    };
    Collection.prototype.getBundle = function (name) {
        return this.bundles[name];
    };
    return Collection;
})();
exports.Collection = Collection;
