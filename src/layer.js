var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="typing.d.ts" />
var path = require('path');
var fs = require('fs');
var events = require('events');
var glob = require('glob');
var watch = require('watch');
var minimatch = require('minimatch');
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
var LayerBase = (function (_super) {
    __extends(LayerBase, _super);
    function LayerBase(name, man) {
        _super.call(this);
        // Transformed files to be packaged in this layer.
        this.files = {};
        /**
         * A cache of built files, useful when `watching`, so that we don't have to rebuild the whole layer.
         */
        this.cache = {};
        this.name = name;
        this.man = man;
    }
    LayerBase.prototype.build = function () {
    };
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
        var json = JSON.stringify(this.cache, null, 2);
        fs.writeFileSync(filepath, json);
        return filepath;
    };
    LayerBase.prototype.toJson = function () {
        return {};
    };
    LayerBase.prototype.watch = function () {
    };
    return LayerBase;
})(events.EventEmitter);
exports.LayerBase = LayerBase;
var Layer = (function (_super) {
    __extends(Layer, _super);
    function Layer() {
        _super.apply(this, arguments);
    }
    Layer.prototype.validateConfig = function (config) {
        if (!config.src)
            this.error('Base directory not defined.');
        if (!(config.globs instanceof Array) || (!config.globs.length))
            this.error('No layer globs defined.');
    };
    Layer.prototype.setConfig = function (config) {
        if (typeof config.globs == 'string')
            config.globs = [config.globs];
        _super.prototype.setConfig.call(this, config);
        this.baseDir = path.resolve(this.conf.src) + path.sep;
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
        // Make layer path use forward slashed `/`.
        var regex = new RegExp('\\' + path.sep, 'g');
        relative = relative.replace(regex, '\/');
        this.cache[relative] = myfile.raw;
    };
    Layer.prototype.toJson = function () {
        return this.cache;
    };
    Layer.prototype.addFile = function (myfile) {
        myfile = this.transformMap.applyTransforms(myfile);
        return this.files[myfile.filepath] = myfile;
    };
    Layer.prototype.addFileByPath = function (filepath) {
        var myfile = this.man.files.get(filepath); // Get file from global repo.
        this.addFile(myfile);
    };
    /**
     * List of absolute file paths.
     */
    Layer.prototype.addFilesByPaths = function (files) {
        files.forEach(this.addFileByPath.bind(this));
    };
    Layer.prototype.addByGlob = function (globexpr) {
        var files = glob.sync(this.baseDir + globexpr);
        this.addFilesByPaths(files);
    };
    Layer.prototype.addFilesByGlobs = function () {
        var self = this;
        this.conf.globs.forEach(function (globexpr) {
            self.addByGlob(globexpr);
        });
    };
    Layer.prototype.doesMatchGlobs = function (filepath) {
        for (var i in this.conf.globs) {
            var globexpr = this.conf.globs[i];
            if (minimatch(filepath, this.baseDir + globexpr)) {
                return true;
            }
        }
        return false;
    };
    Layer.prototype.watch = function () {
        watch.watchTree(this.baseDir, function (filepath, curr, prev) {
            if (typeof filepath == "object" && prev === null && curr === null) {
            }
            else if (prev === null) {
                // f is a new file
                if (this.doesMatchGlobs(filepath)) {
                    var myfile = this.addFile(filepath);
                    this.addFileToCache(myfile);
                    this.emit('file:new', myfile);
                }
            }
            else if (curr.nlink === 0) {
                // f was removed
                console.log('removed', filepath);
            }
            else {
                // f was changed
                if (this.doesMatchGlobs(filepath)) {
                    var rawfile = this.man.files.getFresh(filepath);
                    var myfile = this.addFile(rawfile);
                    this.addFileToCache(myfile);
                    this.emit('file:change', myfile);
                }
            }
        }.bind(this));
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
