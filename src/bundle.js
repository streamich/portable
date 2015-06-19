var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var log = require('./log');
var layer = require('./layer');
var fs = require('fs');
var events = require('events');
var Bundle = (function (_super) {
    __extends(Bundle, _super);
    function Bundle(name, man) {
        _super.call(this);
        this.name = '';
        this.layers = new layer.Collection;
        // Output result of the bundle.
        this.output = '';
        // File extension
        this.extension = 'js';
        this.mimeType = 'application/javascript';
        this.defaultBundler = 'browser';
        this.name = name;
        this.man = man;
    }
    Bundle.prototype.validate = function (conf) {
        if (!conf.volumes || !(conf.volumes instanceof Array) || !(conf.volumes.length)) {
            throw Error('Bundle "' + this.name + '" volumes not defined.');
        }
    };
    Bundle.prototype.setConfig = function (conf) {
        var _this = this;
        this.validate(conf);
        var self = this;
        if (!conf.target)
            conf.target = this.defaultBundler;
        if (!conf.props)
            conf.props = {};
        this.conf = conf;
        if (!(conf.volumes[0] instanceof Array))
            conf.volumes = [conf.volumes];
        this.conf.volumes.forEach(function (voldef) {
            var layer_name = voldef[1];
            _this.layers.addLayer(_this.man.layers.getLayer(layer_name));
        });
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
        // Now go through merge layers.
        this.conf.volumes.forEach(function (voldef) {
            var layer_name = voldef[1];
            var mylayer = _this.man.layers.getLayer(layer_name);
            if (mylayer instanceof layer.LayerMerged) {
                self.layers.addLayer(mylayer);
            }
        });
        this.bundle();
    };
    Bundle.prototype.getBundlerFunction = function (name) {
        try {
            return require('../../portable-bundle-' + name + '/index.js');
        }
        catch (e) {
            try {
                return require('portable-bundle-' + name);
            }
            catch (e) {
                try {
                    return require(name);
                }
                catch (e) {
                    throw Error('Bundle "' + this.name + '" could not find bundler: ' + name);
                }
            }
        }
    };
    Bundle.prototype.bundle = function () {
        var bundler_name = this.conf.target ? this.conf.target : this.defaultBundler;
        var bundler = this.getBundlerFunction(bundler_name);
        this.output = bundler(this, this.conf.props);
    };
    Bundle.prototype.write = function () {
        var filename = this.man.destinationFolder + '/' + this.name + '.js';
        fs.writeFileSync(filename, this.output);
    };
    Bundle.prototype.watch = function () {
        for (var lname in this.layers.layers) {
            var mylayer = this.layers.getLayer(lname);
            mylayer.watch();
            mylayer.on('file:new', function (myfile) {
                this.emit('file:new', myfile, mylayer);
                this.bundle();
            }.bind(this));
            mylayer.on('file:change', function (myfile) {
                this.emit('file:change', myfile, mylayer);
                this.bundle();
            }.bind(this));
            mylayer.on('file:delete', function (myfile) {
                this.emit('file:delete', myfile, mylayer);
                this.bundle();
            }.bind(this));
        }
    };
    return Bundle;
})(events.EventEmitter);
exports.Bundle = Bundle;
var Collection = (function () {
    function Collection() {
        this.bundles = {};
    }
    Collection.prototype.addBundle = function (bundle) {
        this.bundles[bundle.name] = bundle;
    };
    Collection.prototype.getBundle = function (name) {
        return this.bundles[name];
    };
    return Collection;
})();
exports.Collection = Collection;
