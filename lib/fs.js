var path = require('path');
var util = require('util');


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
    birthtim_msec)
{
    util.extend(this, {
        dev: dev,
        mode: mode,
        nlink: nlink,
        uid: uid,
        gid: gid,
        rdev: rdev,
        blksize: blksize,
        ino: ino,
        size: size,
        blocks: blocks,
        atime: new Date(atim_msec),
        mtime: new Date(mtim_msec),
        ctime: new Date(ctim_msec),
        birthtime: new Date(birthtim_msec)
    });
};

var ffalse = function() { return false; };
util.extend(fs.Stats.prototype, {
    isDirectory: ffalse,
    isFile: ffalse,
    isBlockDevice: ffalse,
    isCharacterDevice: ffalse,
    isSymbolicLink: ffalse,
    isFIFO: ffalse,
    isSocket: ffalse
});


fs.writeFileSync = function(p, data) {
    LS[p] = data;
};

fs.writeFile = function(p, data, callback) {
    process.nextTick(function() {
        try {
            fs.writeFileSync(p, data);
        } catch(e) {
            if(callback) callback(e);
        }
    });
};

fs.readFileSync = function(p, encoding) {
    p = path.resolve(p);
    return LS[p];
};

fs.existsSync = function(p, encoding) {
    p = path.resolve(p);
    return typeof LS[p] !== 'undefined';
};
