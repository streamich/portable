/// <reference path="typing.d.ts" />
import layer = require('./layer');
import fs = require('fs');


// A file represents a single file stored in a layer.
export class File {

    /**
     * Absolute file path on the real hard drive.
     */
    filepath: string;

    /**
     * Same as `filepath` but this property cannot be changed by transforms.
     */
    originalFilepath: string;

    /**
     * Layers where this file is used.
     * @type {layer.Layer[]}
     */
    layers: layer.Layer[] = [];

    /**
     * Raw contents of the file.
     */
    raw: string;

    /**
     * A parent file from which this file was created using a transform.
     * @type {null}
     */
    transformParent: File = null;

    /**
     * A transform function applied to parent file to get this file.
     */
    transform: (file: File) => void = null;

    constructor(filepath: string) {
        this.filepath = filepath;
    }

    read() {
        this.originalFilepath = this.filepath;
        this.setSource(fs.readFileSync(this.filepath).toString());
    }

    setSource(raw) {
        this.raw = raw;
    }

    cloneForTransform(transform) {
        var newfile = new File(this.filepath);
        newfile.raw = this.raw;
        newfile.transform = transform;
        newfile.transformParent = this;
        return newfile;
    }
}


/**
 * A global file collection. This is used to hold raw untransformed files as read from HD.
 */
export class Collection {

    /**
     * A map of absolute file paths as read from hard drive.
     */
    files: {[s: string]: File} = {};

    getFile(abs_path: string) {
        var file = this.files[abs_path];
        if(file) return file;

        return this.files[abs_path] = this.readFile(abs_path);
    }

    readFile(abs_path: string) {
        var file = new File(abs_path);
        file.read();
        return file;
    }

    /**
     * Absolute file path.
     */
    get(filepath: string): File {
        if(!this.files[filepath]) {
            var myfile = new File(filepath);
            myfile.read();
            this.files[filepath] = myfile;
        }
        return this.files[filepath];
    }

    /**
     * Read the file from disk again.
     */
    getFresh(filepath: string): File {
        var myfile = this.files[filepath];
        if(!myfile) return this.get(filepath);
        myfile.read();
        return myfile;
    }
}
