/// <reference path="typing.d.ts" />
import path = require('path');
import file = require('file');
import manifest = require('./manifest');
import fs = require('fs');
import events = require('events');
var glob = require('glob');
var watch = require('watch');
var minimatch = require('minimatch');


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


export class LayerBase extends events.EventEmitter {

    man: manifest.Manifest;

    name: string;

    // Transformed files to be packaged in this layer.
    files: any = {};

    conf: any;

    /**
     * A cache of built files, useful when `watching`, so that we don't have to rebuild the whole layer.
     */
    cache: {[s: string]: string} = {};

    built: boolean = false;

    constructor(name: string, man: manifest.Manifest) {
        super();
        this.name = name;
        this.man = man;
    }

    build() {

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
        var filepath = dest + '/' + filename;
        var json = JSON.stringify(this.cache, null, 2);
        fs.writeFileSync(filepath, json);
        return filepath;
    }

    toJson() {
        return this.cache;
    }

    watch() {}
}


export class Layer extends LayerBase {

    baseDir: string;

    transformMap: TransformMap;

    conf: manifest.ILayersConfig;

    validateConfig(config: manifest.ILayersConfig) {
        if(!config.src) this.error('Base directory not defined.');
        if(!(config.glob instanceof Array) || (!config.glob.length))
            this.error('No layer globs defined.');
        if(config.transform && !(config.transform instanceof Array))
            this.error('Invalid transforms parameter.');
    }

    setConfig(config) {
        if(typeof config.glob == 'string') config.glob = [config.glob];

        super.setConfig(config);
        this.baseDir = path.resolve(this.man.dir, this.conf.src) + path.sep;

        if(config.transform) {
            if (!(config.transform[0] instanceof Array)) config.transform = [config.transform];
        } else {
            config.transform = [];
        }

        this.transformMap = new TransformMap;
        this.transformMap.loadTransforms(this.conf.transform);
    }

    build() {
        if(!this.built) {
            this.files = [];            // Reset.
            this.addFilesByGlobs();     // Read files from HD, if needed and apply transforms.
            this.populateCache();
            this.built = true;
        }
    }

    populateCache() {
        for(var filepath in this.files) this.addFileToCache(this.files[filepath]);
    }

    addFileToCache(myfile: file.File) {
        var relative = path.relative(this.baseDir, myfile.filepath);

        // Make layer path use forward slashed `/`.
        var regex = new RegExp('\\' + path.sep, 'g');
        relative = relative.replace(regex, '\/');

        this.cache[relative] = myfile.raw;
    }

    addFile(myfile: file.File) {
        myfile = this.transformMap.applyTransforms(myfile);
        return this.files[myfile.filepath] = myfile;
    }

    addFileByPath(filepath: string) {
        var myfile = this.man.files.get(filepath); // Get file from global repo.
        this.addFile(myfile);
    }

    /**
     * List of absolute file paths.
     */
    addFilesByPaths(files: string[]) {
        files.forEach(function(filepath) {
            if(fs.statSync(filepath).isFile()) {
                this.addFileByPath(filepath);
            }
        }.bind(this));
    }

    addByGlob(globexpr) {
        var files = glob.sync(this.baseDir + globexpr);
        this.addFilesByPaths(files);
    }

    addFilesByGlobs() {
        var self = this;
        this.conf.glob.forEach((globexpr) => {
            self.addByGlob(globexpr);
        });
    }

    doesMatchGlobs(filepath) {
        for(var i in this.conf.glob) {
            var globexpr = this.conf.glob[i];
            if(minimatch(filepath, this.baseDir + globexpr)) {
                return true;
            }
        }
        return false;
    }

    watch() {
        watch.watchTree(this.baseDir, function(filepath, curr, prev) {

            if(typeof filepath == "object" && prev === null && curr === null) {
                // Finished walking the tree
            } else if (prev === null) {
                // f is a new file
                if(this.doesMatchGlobs(filepath)) {
                    var rawfile = this.man.files.getFresh(filepath);
                    var myfile = this.addFile(rawfile);
                    this.addFileToCache(myfile);
                    this.emit('file:new', myfile);
                }
            } else if (curr.nlink === 0) {
                // f was removed
                console.log('removed', filepath);
            } else {
                // f was changed
                if(this.doesMatchGlobs(filepath)) {
                    var rawfile = this.man.files.getFresh(filepath);
                    var myfile = this.addFile(rawfile);
                    this.addFileToCache(myfile);
                    this.emit('file:change', myfile);
                }
            }
        }.bind(this));
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

    conf: manifest.IMergeConfig;

    build() {
        if(!this.built) {
            this.conf.layers.forEach(function(tuple) {
                var lname = tuple[0];
                var lpath = tuple[1];

                // Add trailing slash.
                if(lpath[lpath.length - 1] != '/') lpath += '/';

                var layer = this.man.layers.getLayer(lname);
                layer.build();
                for(var rel in layer.cache) {
                    this.cache[lpath + rel] = layer.cache[rel];
                }
            }.bind(this));
            this.built = true;
        }
    }

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