/// <reference path="typing.d.ts" />
var fs = require('fs');
var path = require('path');
var glob = require('glob');
import LoaderRaw = require('./loader/Raw');
import LoaderJs = require('./loader/Js');


export interface IBuildConfig {
    base: string;       // Where to look for files.
    globs: string[];    // List of globs to find files.
    dest?: string;      // Destination folder, relative to the main config `dest` (optional).
    name?: string;      // File name to use, otherwise the name of the layer is used. (Do we need this options?)
    minify?: boolean;   // Whether to minify.
    filename?: string;  // Optional file name, otwherwise this.name + '.json'.
}


export interface IPackagableLayer {

}


export class Layer implements  IPackagableLayer {

    name: string;

    files:any = {};

    loaderRaw = new LoaderRaw;
    loaderJs = new LoaderJs;

    conf: IBuildConfig;

    baseDir: string;

    constructor(name) {
        this.name = name;
    }

    error(msg) {
        throw Error('Layer (' + this.name + '): ' + msg);
    }

    setConfig(config: IBuildConfig) {
        if(!config.base) this.error('Base directory not defined.');
        if(!(config.globs instanceof Array) || (!config.globs.length))
            this.error('No layer globs defined.');

        config.minify = typeof config.minify == 'undefined' ? true : !!config.minify;

        this.conf = config;
        this.baseDir = path.resolve(this.conf.base) + path.sep;
    }

    load(file) {
        if(this.conf.minify) {
            try {
                return this.loaderJs.load(file);
            } catch(e) {
                return this.loaderRaw.load(file);
            }
        } else {
            return this.loaderRaw.load(file);
        }
    }

    addFiles(files) {
        var self = this;
        files.forEach(function(file) {
            var relative = path.relative(self.baseDir, file);
            self.files[relative] = self.load(file);
        });
    }

    addByGlob(globexpr) {
        var files = glob.sync(this.baseDir + globexpr);
        this.addFiles(files);
    }

    addFilesByGlobs() {
        var self = this;
        this.conf.globs.forEach((globexpr) => {
            self.addByGlob(globexpr);
        });
    }

    getFileName() {
        if(this.conf.filename) return this.conf.filename;
        else return this.name + '.json';
    }

    write(dest) {
        if(this.conf.dest) dest = this.conf.dest;
        var filename = this.getFileName();
        var filepath = path.resolve(dest + '/' + filename);
        var json = JSON.stringify(this.files, null, 2);
        fs.writeFileSync(filepath, json);
        return filepath;
    }


}


/**
 * This class represents a layer which is a result of merging together other layers.
 */
export class LayerMerged implements IPackagableLayer {

}