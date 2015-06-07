/// <reference path="typing.d.ts" />
import path = require('path');
import fs = require('fs');
import layer = require('./layer');


export interface IManifestData {
    dest?: string;                  // Destination/build folder.
    layers?: layer.IBuildConfig[];
}


/**
 * 'manifest' is the `portable.js` file the we read to get the JSON object defining how we should build the `fs`.
 */
export class Manifest {

    static defaultManifestFile = 'portable.js';

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

    error(msg) {
        throw Error('Manifest: ' + msg + ' (' + this.filepath + ').');
    }

    readFile(file: string = '') {
        if(!file) file = Manifest.defaultManifestFile;
        file = path.resolve(file);

        if(!fs.existsSync(file))
            throw Error('Manifest not found: ' + file);
        this.data = require(file);
        this.validate();
        this.parse();
    }

    validate() {
        if(typeof this.data != 'object')
            this.error('Invalid manifest contents');
        if(!this.data.dest || (typeof this.data.dest != 'string'))
            this.error('Destination `dest` not specified.');
    }

    parse() {
        this.destinationFolder = path.resolve(this.data.dest);
    }

}
