/// <reference path="typing.d.ts" />
import path = require('path');
import file = require('file');
import manifest = require('./manifest');
import fs = require('fs');
var glob = require('glob');


export interface ITransform {
    (f: file.File): void;
}


/**
 * A collection of transforms to apply to each file of this layer by regex.
 */
export class TransformMap {

    /**
     * Use provided us a string as a transform, but we need  a function, so we load it from somewhere.
     * (1) `portable-transform-<name>` package.
     * (2) `<name>` package.
     * (3) `./transform/transform-<name>.js`
     * @param name
     */
    static loadTransformFunction(name: string) {
        try {
            return require('portable-transform-' + name);
        } catch(e) {
            try {
                return require(name);
            } catch(e) {
                try {
                    return require('./transform/transform-' + name);
                } catch(e) {
                    throw Error('Could not find transform package: ' + name);
                }
            }
        }
    }

    regexes: RegExp[] = [];
    transforms: ITransform[][] = [];

    validate(t: (string|(string|ITransform|string[]|ITransform[])[])[]) {
        // Validate transforms list.
        this.transforms.forEach((transforms, i) => {
            if(!(<any> transforms instanceof Array) || (transforms.length != 2))
                throw Error('In valid transforms configuration: ' + i);
            if(typeof transforms[0] != 'string')
                throw Error('First transforms argument must be a regular express string.');
            if((typeof transforms[1] != 'string') && (typeof transforms[1] != 'function') && !(<any> transforms[1] instanceof Array))
                throw Error('Second transforms argument must be a collection of transforms.');
        });
    }

    /**
     * Load transform functions.
     * @param t A list of regexes and transforms to apply as specified in manifest.
     */
    loadTransforms(t: (string|(string|ITransform|string[]|ITransform[])[])[]) {
        this.validate(t);
        var self = this;

        this.regexes = [];
        this.transforms = [];

        if(t && t.length) {
            t.forEach((each) => {
                var transform_definitions = <any> each[1] instanceof Array ? each[1] : [each[1]];
                var list = [];
                (<any[]> transform_definitions).forEach((def) => {
                    if (typeof def == 'string') {
                        list.push(TransformMap.loadTransformFunction(def));
                    } else if (typeof def == 'function') {
                        list.push(def); // Just use user's provided function.
                    } else {
                        throw Error('Unexpected transform definition: ' + each[0]);
                    }
                });

                this.regexes.push(new RegExp(<string> each[0]));
                this.transforms.push(list);
            });
        }
    }

    /**
     * Applies all transformations to a file. Saves all intermediate file history.
     * And returns the resulting file.
     * @param f
     * @returns {file.File}
     */
    applyTransforms(f: file.File) {
        this.regexes.forEach((regex, i) => {
            if(f.filepath.match(regex)) { // Tranform regex matches this file, so apply it.
                this.transforms[i].forEach((transform) => {
                    f = f.cloneForTransform(transform);
                    transform(f);
                });
            }
        });
        return f;
    }
}


export class LayerBase {

    man: manifest.Manifest;

    name: string;

    // Transformed files to be packaged in this layer.
    files: any = {};

    conf: manifest.ILayersConfig;

    constructor(name: string, man: manifest.Manifest) {
        this.name = name;
        this.man = man;
    }

    error(msg) {
        throw Error('Layer (' + this.name + '): ' + msg);
    }

    // Throws on error.
    validateConfig(config: any) {}

    setConfig(config: any) {
        this.validateConfig(config);
        this.conf = config;
    }

    getFileName() {
        if(this.conf.filename) return this.conf.filename;
        else return this.name + '.json';
    }

    getFiles() {
        console.log('layer files');
    }

    write(dest) {
        var filename = this.getFileName();
        var filepath = path.resolve(dest + '/' + filename);
        var json = JSON.stringify(this.files, null, 2);
        fs.writeFileSync(filepath, json);
        return filepath;
    }

    toJson() {
        return {};
    }
}


export class Layer extends LayerBase {

    baseDir: string;

    transformMap: TransformMap;

    /**
     * A cache of built files, useful when `watching`, so that we don't have to rebuild the whole layer.
     */
    cache: {[s: string]: string} = {};

    validateConfig(config: manifest.ILayersConfig) {
        if(!config.base) this.error('Base directory not defined.');
        if(!(config.globs instanceof Array) || (!config.globs.length))
            this.error('No layer globs defined.');
    }

    setConfig(config) {
        super.setConfig(config);
        this.baseDir = path.resolve(this.conf.base) + path.sep;

        this.transformMap = new TransformMap;
        this.transformMap.loadTransforms(this.conf.transform);
    }

    build() {
        this.files = [];            // Reset.
        this.addFilesByGlobs();     // Read files from HD, if needed and apply transforms.
        this.populateCache();
    }

    populateCache() {
        for(var filepath in this.files) this.addFileToCache(this.files[filepath]);
    }

    addFileToCache(myfile) {
        var relative = path.relative(this.baseDir, myfile.filepath);
        this.cache[relative] = myfile.raw;
    }

    toJson() {
        return this.cache;
    }

    /**
     * List of absolute file paths.
     */
    addFiles(files: string[]) {
        var self = this;
        files.forEach(function(file) {
            //var relative = path.relative(self.baseDir, file);
            var myfile = self.man.files.get(file); // Get file from global repo.
            myfile = self.transformMap.applyTransforms(myfile);
            self.files[myfile.filepath] = myfile;
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
}


/**
 * This class represents a layer which is a result of merging together other layers.
 */
export class LayerMerged extends LayerBase {

    /**
     * Layers to be merged (in the right order).
     */
    layers: Layer[] = [];

    /**
     * Root paths where each layer is merged.
     */
    roots: string[] = [];

}


export class Collection {

    /**
     * Collection of layers by name.
     */
    layers: {[s: string]: LayerBase} = {};

    addLayer(layer: LayerBase) {
        this.layers[layer.name] = layer;
    }

    getLayer(name: string): LayerBase {
        return this.layers[name];
    }

}