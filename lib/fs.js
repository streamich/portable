var path = require('path');


var LS = typeof localStorage != 'undefined' ? localStorage : {};
LS['/tmp'] = null; // `null` means it is a directory.

function pathAbsolute(p) {
    return p;
}

var fs = exports;

// Static method to set the stats properties on a Stats object.
fs.Stats = function(
    dev,
    mode,
    nlink,
    uid,
    gid,
    rdev,
    blksize,
    ino,
    size,
    blocks,
    atim_msec,
    mtim_msec,
    ctim_msec,
    birthtim_msec) {
    this.dev = dev;
    this.mode = mode;
    this.nlink = nlink;
    this.uid = uid;
    this.gid = gid;
    this.rdev = rdev;
    this.blksize = blksize;
    this.ino = ino;
    this.size = size;
    this.blocks = blocks;
    this.atime = new Date(atim_msec);
    this.mtime = new Date(mtim_msec);
    this.ctime = new Date(ctim_msec);
    this.birthtime = new Date(birthtim_msec);
};

fs.Stats.prototype.isDirectory = function() {
    return this._checkModeProperty(constants.S_IFDIR);
};

fs.Stats.prototype.isFile = function() {
    return this._checkModeProperty(constants.S_IFREG);
};

fs.Stats.prototype.isBlockDevice = function() {
    return this._checkModeProperty(constants.S_IFBLK);
};

fs.Stats.prototype.isCharacterDevice = function() {
    return this._checkModeProperty(constants.S_IFCHR);
};

fs.Stats.prototype.isSymbolicLink = function() {
    return this._checkModeProperty(constants.S_IFLNK);
};

fs.Stats.prototype.isFIFO = function() {
    return this._checkModeProperty(constants.S_IFIFO);
};

fs.Stats.prototype.isSocket = function() {
    return this._checkModeProperty(constants.S_IFSOCK);
};


fs.writeFileSync = function(p, data) {
    LS[p] = data;
};

fs.writeFile = function(p, data, callback) {
    try {
        fs.writeFileSync(p, data);
        callack();
    } catch(e) {
        callback(e);
    }
};

fs.readFileSync = function(p, encoding) {

};

fs.existsSync = function(p) {

};

