var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="typing.d.ts" />
var path = require('path');
var fs = require('fs');
var glob = require('glob');
/**
 * A collection of transforms to apply to each file of this layer by regex.
 */
var TransformMap = (function () {
    function TransformMap() {
        this.regexes = [];
        this.transforms = [];
    }
    /**
     * Use provided us a string as a transform, but we need  a function, so we load it from somewhere.
     * (1) `portable-transform-<name>` package.
     * (2) `<name>` package.
     * (3) `./transform/transform-<name>.js`
     * @param name
     */
    TransformMap.loadTransformFunction = function (name) {
        try {
            return require('portable-transform-' + name);
        }
        catch (e) {
            try {
                return require(name);
            }
            catch (e) {
                try {
                    return require('./transform/transform-' + name);
                }
                catch (e) {
                    throw Error('Could not find transform package: ' + name);
                }
            }
        }
    };
    TransformMap.prototype.validate = function (t) {
        // Validate transforms list.
        this.transforms.forEach(function (transforms, i) {
            if (!(transforms instanceof Array) || (transforms.length != 2))
                throw Error('In valid transforms configuration: ' + i);
            if (typeof transforms[0] != 'string')
                throw Error('First transforms argument must be a regular express string.');
            if ((typeof transforms[1] != 'string') && (typeof transforms[1] != 'function') && !(transforms[1] instanceof Array))
                throw Error('Second transforms argument must be a collection of transforms.');
        });
    };
    /**
     * Load transform functions.
     * @param t A list of regexes and transforms to apply as specified in manifest.
     */
    TransformMap.prototype.loadTransforms = function (t) {
        var _this = this;
        this.validate(t);
        var self = this;
        this.regexes = [];
        this.transforms = [];
        if (t && t.length) {
            t.forEach(function (each) {
                var transform_definitions = each[1] instanceof Array ? each[1] : [each[1]];
                var list = [];
                transform_definitions.forEach(function (def) {
                    if (typeof def == 'string') {
                        list.push(TransformMap.loadTransformFunction(def));
                    }
                    else if (typeof def == 'function') {
                        list.push(def); // Just use user's provided function.
                    }
                    else {
                        throw Error('Unexpected transform definition: ' + each[0]);
                    }
                });
                _this.regexes.push(new RegExp(each[0]));
                _this.transforms.push(list);
            });
        }
    };
    /**
     * Applies all transformations to a file. Saves all intermediate file history.
     * And returns the resulting file.
     * @param f
     * @returns {file.File}
     */
    TransformMap.prototype.applyTransforms = function (f) {
        var _this = this;
        this.regexes.forEach(function (regex, i) {
            if (f.filepath.match(regex)) {
                _this.transforms[i].forEach(function (transform) {
                    f = f.cloneForTransform(transform);
                    transform(f);
                });
            }
        });
        return f;
    };
    return TransformMap;
})();
exports.TransformMap = TransformMap;
var LayerBase = (function () {
    function LayerBase(name, man) {
        // Transformed files to be packaged in this layer.
        this.files = {};
        this.name = name;
        this.man = man;
    }
    LayerBase.prototype.error = function (msg) {
        throw Error('Layer (' + this.name + '): ' + msg);
    };
    // Throws on error.
    LayerBase.prototype.validateConfig = function (config) {
    };
    LayerBase.prototype.setConfig = function (config) {
        this.validateConfig(config);
        this.conf = config;
    };
    LayerBase.prototype.getFileName = function () {
        if (this.conf.filename)
            return this.conf.filename;
        else
            return this.name + '.json';
    };
    LayerBase.prototype.getFiles = function () {
        console.log('layer files');
    };
    LayerBase.prototype.write = function (dest) {
        var filename = this.getFileName();
        var filepath = path.resolve(dest + '/' + filename);
        var json = JSON.stringify(this.files, null, 2);
        fs.writeFileSync(filepath, json);
        return filepath;
    };
    LayerBase.prototype.toJson = function () {
        return {};
    };
    return LayerBase;
})();
exports.LayerBase = LayerBase;
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer() {
        _super.apply(this, arguments);
        /**
         * A cache of built files, useful when `watching`, so that we don't have to rebuild the whole layer.
         */
        this.cache = {};
    }
    Layer.prototype.validateConfig = function (config) {
        if (!config.base)
            this.error('Base directory not defined.');
        if (!(config.globs instanceof Array) || (!config.globs.length))
            this.error('No layer globs defined.');
    };
    Layer.prototype.setConfig = function (config) {
        _super.prototype.setConfig.call(this, config);
        this.baseDir = path.resolve(this.conf.base) + path.sep;
        this.transformMap = new TransformMap;
        this.transformMap.loadTransforms(this.conf.transform);
    };
    Layer.prototype.build = function () {
        this.files = []; // Reset.
        this.addFilesByGlobs(); // Read files from HD, if needed and apply transforms.
        this.populateCache();
    };
    Layer.prototype.populateCache = function () {
        for (var filepath in this.files)
            this.addFileToCache(this.files[filepath]);
    };
    Layer.prototype.addFileToCache = function (myfile) {
        var relative = path.relative(this.baseDir, myfile.filepath);
        this.cache[relative] = myfile.raw;
    };
    Layer.prototype.toJson = function () {
        return this.cache;
    };
    /**
     * List of absolute file paths.
     */
    Layer.prototype.addFiles = function (files) {
        var self = this;
        files.forEach(function (file) {
            //var relative = path.relative(self.baseDir, file);
            var myfile = self.man.files.get(file); // Get file from global repo.
            myfile = self.transformMap.applyTransforms(myfile);
            self.files[myfile.filepath] = myfile;
        });
    };
    Layer.prototype.addByGlob = function (globexpr) {
        var files = glob.sync(this.baseDir + globexpr);
        this.addFiles(files);
    };
    Layer.prototype.addFilesByGlobs = function () {
        var self = this;
        this.conf.globs.forEach(function (globexpr) {
            self.addByGlob(globexpr);
        });
    };
    return Layer;
})(LayerBase);
exports.Layer = Layer;
/**
 * This class represents a layer which is a result of merging together other layers.
 */
var LayerMerged = (function (_super) {
    __extends(LayerMerged, _super);
    function LayerMerged() {
        _super.apply(this, arguments);
        /**
         * Layers to be merged (in the right order).
         */
        this.layers = [];
        /**
         * Root paths where each layer is merged.
         */
        this.roots = [];
    }
    return LayerMerged;
})(LayerBase);
exports.LayerMerged = LayerMerged;
var Collection = (function () {
    function Collection() {
        /**
         * Collection of layers by name.
         */
        this.layers = {};
    }
    Collection.prototype.addLayer = function (layer) {
        this.layers[layer.name] = layer;
    };
    Collection.prototype.getLayer = function (name) {
        return this.layers[name];
    };
    return Collection;
})();
exports.Collection = Collection;
