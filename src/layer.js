/// <reference path="typing.d.ts" />
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var LoaderRaw = require('./loader/Raw');
var LoaderJs = require('./loader/Js');
var Layer = (function () {
    function Layer(name) {
        this.files = {};
        this.loaderRaw = new LoaderRaw;
        this.loaderJs = new LoaderJs;
        this.name = name;
    }
    Layer.prototype.error = function (msg) {
        throw Error('Layer (' + this.name + '): ' + msg);
    };
    Layer.prototype.setConfig = function (config) {
        if (!config.base)
            this.error('Base directory not defined.');
        if (!(config.globs instanceof Array) || (!config.globs.length))
            this.error('No layer globs defined.');
        config.minify = typeof config.minify == 'undefined' ? true : !!config.minify;
        this.conf = config;
        this.baseDir = path.resolve(this.conf.base) + path.sep;
    };
    Layer.prototype.load = function (file) {
        if (this.conf.minify) {
            try {
                return this.loaderJs.load(file);
            }
            catch (e) {
                return this.loaderRaw.load(file);
            }
        }
        else {
            return this.loaderRaw.load(file);
        }
    };
    Layer.prototype.addFiles = function (files) {
        var self = this;
        files.forEach(function (file) {
            var relative = path.relative(self.baseDir, file);
            self.files[relative] = self.load(file);
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
    Layer.prototype.getFileName = function () {
        if (this.conf.filename)
            return this.conf.filename;
        else
            return this.name + '.json';
    };
    Layer.prototype.write = function (dest) {
        if (this.conf.dest)
            dest = this.conf.dest;
        var filename = this.getFileName();
        var filepath = path.resolve(dest + '/' + filename);
        var json = JSON.stringify(this.files, null, 2);
        fs.writeFileSync(filepath, json);
        return filepath;
    };
    return Layer;
})();
exports.Layer = Layer;
/**
 * This class represents a layer which is a result of merging together other layers.
 */
var LayerMerged = (function () {
    function LayerMerged() {
    }
    return LayerMerged;
})();
exports.LayerMerged = LayerMerged;
