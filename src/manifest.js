/// <reference path="typing.d.ts" />
var path = require('path');
var fs = require('fs');
var layer = require('./layer');
var file = require('./file');
var bundle = require('./bundle');
/**
 * 'manifest' is the `portable.js` file the we read to get the JSON object defining how we should build the `fs`.
 */
var Manifest = (function () {
    function Manifest() {
        /**
         * The outputs of the manifest file.
         */
        this.data = {};
        /**
         * Folder where the files will be built.
         * @type {string}
         */
        this.destinationFolder = '';
        // Global collections of main building blocks.
        this.files = new file.Collection; // As the appear on HD.
        this.layers = new layer.Collection; // All layers.
        this.bundles = new bundle.Collection; // All bundles.
    }
    Manifest.readFile = function (file) {
        if (file === void 0) { file = ''; }
        var manifest = new Manifest;
        manifest.readFile(file);
        return manifest;
    };
    Manifest.prototype.error = function (msg) {
        throw Error('Manifest: ' + msg + ' (' + this.filepath + ').');
    };
    Manifest.prototype.readFile = function (file) {
        if (file === void 0) { file = ''; }
        if (file) {
            file = path.resolve(file);
            if (!fs.existsSync(file))
                throw Error('Manifest not found: ' + file);
        }
        else {
            for (var i = 0; i < Manifest.defaultManifestFiles.length; i++) {
                var filepath = path.resolve(Manifest.defaultManifestFiles[i]);
                if (fs.existsSync(filepath)) {
                    file = filepath;
                    break;
                }
            }
            if (!file)
                throw Error('Manifest not found, looking for one of: ' + Manifest.defaultManifestFiles.join(', '));
        }
        this.data = require(file);
        this.validate();
        this.parse();
    };
    Manifest.prototype.validate = function () {
        if (typeof this.data != 'object')
            this.error('Invalid manifest contents');
        if (!this.data.dest || (typeof this.data.dest != 'string'))
            this.error('Destination `dest` not specified.');
        if (!this.data.layer || (typeof this.data.layer != 'object'))
            this.error('Layers not defined.');
        // optional:
        if (this.data.merge && (typeof this.data.merge != 'object'))
            this.error('Invalid `merge` definition.');
        if (this.data.bundle && (typeof this.data.bundle != 'object'))
            this.error('Invalid `bundle` definition.');
    };
    Manifest.prototype.parse = function () {
        this.destinationFolder = path.resolve(this.data.dest);
        for (var lname in this.data.layer) {
            var mylayer = new layer.Layer(lname, this);
            mylayer.setConfig(this.data.layer[lname]);
            this.layers.addLayer(mylayer);
        }
        if (this.data.merge) {
            for (var lname in this.data.merge) {
                if (this.layers.getLayer(lname))
                    throw Error('Layer already exists, name `merge` layer differently: ' + lname);
                var megelayer = new layer.LayerMerged(lname, this);
                megelayer.setConfig(this.data.merge[lname]);
                this.layers.addLayer(megelayer);
            }
        }
        if (this.data.bundle) {
            for (var bname in this.data.bundle) {
                var mybundle = new bundle.Bundle(bname, this);
                mybundle.setConfig(this.data.bundle[bname]);
                this.bundles.addBundle(mybundle);
            }
        }
    };
    /**
     * Default manifest file names that `portable.js` will look for by default in a folder in their priority order.
     */
    Manifest.defaultManifestFiles = [
        'portable.js',
        'portable.config.js',
        'portable.json',
        'portable.config.json'
    ];
    return Manifest;
})();
exports.Manifest = Manifest;
