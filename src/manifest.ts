/// <reference path="typing.d.ts" />
import path = require('path');
import fs = require('fs');
import layer = require('./layer');
import file = require('./file');
import bundle = require('./bundle');


export interface ILayersConfig {
    src?: string;                   // Root dir where to look for files.
    globs: string[];                // Globs to apply.
    filename?: string;              // Optional custom file name for the layer.
    transform?: any[];              // Transforms to apply to source code of files in this layer.
}


export interface IMergeConfig {
    layers: string[]|string[][];    // Tuples or layer names and their roots. Or just layer name, ir root is ''.
}


export interface IBundleConfig {
    target?: string;                // Type of the bundle to export.
    volumes: string[][];            // List of tuples [mountpoint, layer] to mount as `fs` folders.
    options: any;                   // Optional options to provide to the bundler.
    props: any;
}


export interface IServerConfig {
    port?: number;
}


export interface IManifestData {
    dest: string;                   // Destination/build folder.
    layer:      {[s: string]: ILayersConfig};
    merge?:     {[s: string]: IMergeConfig};
    bundle?:    {[s: string]: IBundleConfig};
    server?: IServerConfig;
}


/**
 * 'manifest' is the `portable.js` file the we read to get the JSON object defining how we should build the `fs`.
 */
export class Manifest {

    /**
     * Default manifest file names that `portable.js` will look for by default in a folder in their priority order.
     */
    static defaultManifestFiles = [
        'portable.js',
        'portable.config.js',
        'portable.json',
        'portable.config.json'
    ];

    static readFile(file: string = '') {
        var manifest = new Manifest;
        manifest.readFile(file);
        return manifest;
    }

    filepath: string;

    /**
     * The outputs of the manifest file.
     */
    data: any = {};

    /**
     * Folder where the files will be built.
     * @type {string}
     */
    destinationFolder: string = '';

    // Global collections of main building blocks.
    files: file.Collection = new file.Collection;       // As the appear on HD.
    layers: layer.Collection = new layer.Collection;    // All layers.
    bundles: bundle.Collection = new bundle.Collection; // All bundles.

    error(msg) {
        throw Error('Manifest: ' + msg + ' (' + this.filepath + ').');
    }

    readFile(file: string = '') {
        if(file) {
            file = path.resolve(file);
            if(!fs.existsSync(file)) throw Error('Manifest not found: ' + file);
        } else {
            for(var i = 0; i < Manifest.defaultManifestFiles.length; i++) {
                var filepath = path.resolve(Manifest.defaultManifestFiles[i]);
                if(fs.existsSync(filepath)) {
                    file = filepath;
                    break;
                }
            }
            if(!file) throw Error('Manifest not found, looking for one of: ' + Manifest.defaultManifestFiles.join(', '));
        }
        try {
            if (file.match(/\.js$/)) {
                this.data = require(file);
            } else {
                this.data = JSON.parse(fs.readFileSync(file).toString());
            }
        } catch(e) {
            throw Error('Config file not found: ' + file);
        }
        console.log(this.data);
        this.validate();
        this.parse();
    }

    validate() {
        if(typeof this.data != 'object')
            this.error('Invalid manifest contents');
        if(!this.data.dest || (typeof this.data.dest != 'string'))
            this.error('Destination `dest` not specified.');
        if(!this.data.layer || (typeof this.data.layer != 'object'))
            this.error('Layers not defined.');

        // optional:
        if(this.data.merge && (typeof this.data.merge != 'object'))
            this.error('Invalid `merge` definition.');
        if(this.data.bundle && (typeof this.data.bundle != 'object'))
            this.error('Invalid `bundle` definition.');
    }

    parse() {
        this.destinationFolder = path.resolve(this.data.dest);

        for(var lname in this.data.layer) {
            var mylayer = new layer.Layer(lname, this);
            mylayer.setConfig(this.data.layer[lname]);
            this.layers.addLayer(mylayer);
        }

        if(this.data.merge) {
            for(var lname in this.data.merge) {
                if(this.layers.getLayer(lname)) throw Error('Layer already exists, name `merge` layer differently: ' + lname);
                var megelayer = new layer.LayerMerged(lname, this);
                megelayer.setConfig(this.data.merge[lname]);
                this.layers.addLayer(megelayer);
            }
        }

        if(this.data.bundle) {
            for(var bname in this.data.bundle) {
                var mybundle = new bundle.Bundle(bname, this);
                mybundle.setConfig(this.data.bundle[bname]);
                this.bundles.addBundle(mybundle);
            }
        }
    }

}
