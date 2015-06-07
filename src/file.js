var fs = require('fs');
// A file represents a single file stored in a layer.
var File = (function () {
    function File(filepath) {
        /**
         * Layers where this file is used.
         * @type {layer.Layer[]}
         */
        this.layers = [];
        /**
         * A parent file from which this file was created using a transform.
         * @type {null}
         */
        this.transformParent = null;
        /**
         * A transform function applied to parent file to get this file.
         */
        this.transform = null;
        this.filepath = filepath;
    }
    File.prototype.read = function () {
        this.originalFilepath = this.filepath;
        this.setSource(fs.readFileSync(this.filepath).toString());
    };
    File.prototype.setSource = function (raw) {
        this.raw = raw;
    };
    File.prototype.cloneForTransform = function (transform) {
        var newfile = new File(this.filepath);
        newfile.raw = this.raw;
        newfile.transform = transform;
        newfile.transformParent = this;
        return newfile;
    };
    return File;
})();
exports.File = File;
/**
 * A global file collection. This is used to hold raw untransformed files as read from HD.
 */
var Collection = (function () {
    function Collection() {
        /**
         * A map of absolute file paths as read from hard drive.
         */
        this.files = {};
    }
    Collection.prototype.getFile = function (abs_path) {
        var file = this.files[abs_path];
        if (file)
            return file;
        return this.files[abs_path] = this.readFile(abs_path);
    };
    Collection.prototype.readFile = function (abs_path) {
        var file = new File(abs_path);
        file.read();
        return file;
    };
    /**
     * Absolute file path.
     */
    Collection.prototype.get = function (filepath) {
        if (!this.files[filepath]) {
            var myfile = new File(filepath);
            myfile.read();
            this.files[filepath] = myfile;
        }
        return this.files[filepath];
    };
    return Collection;
})();
exports.Collection = Collection;
