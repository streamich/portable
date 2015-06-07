/// <reference path="typing.d.ts" />
var path = require('path');
var fs = require('fs');
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
        if (!file)
            file = Manifest.defaultManifestFile;
        file = path.resolve(file);
        if (!fs.existsSync(file))
            throw Error('Manifest not found: ' + file);
        this.data = require(file);
        this.validate();
        this.parse();
    };
    Manifest.prototype.validate = function () {
        if (typeof this.data != 'object')
            this.error('Invalid manifest contents');
        if (!this.data.dest || (typeof this.data.dest != 'string'))
            this.error('Destination `dest` not specified.');
    };
    Manifest.prototype.parse = function () {
        this.destinationFolder = path.resolve(this.data.dest);
    };
    Manifest.defaultManifestFile = 'portable.js';
    return Manifest;
})();
exports.Manifest = Manifest;
