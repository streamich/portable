var path = require('path');
var util = require('util');


//var LS = typeof localStorage != 'undefined' ? localStorage : {};
var DRIVE = {};

var fs = exports;
fs.DRIVE = DRIVE;

// Static method to set the stats properties on a Stats object.
fs.Stats = function() {
    util.extend(this, {
        _isDir: false,
        _isFile: false
    });
};

var ffalse = function() { return false; };
util.extend(fs.Stats.prototype, {
    isDirectory: function() { return this._isDir; },
    isFile: function() { return this._isFile; }
});


fs.writeFileSync = function(p, data) {
    var filepath = path.resolve(p);
    DRIVE[filepath] = data;
};

fs.writeFile = function(p, data, callback) {
    process.nextTick(function() {
        fs.writeFileSync(p, data);
        if(callback) callback();
    });
};

fs.readFileSync = function(p) {
    var filepath = path.resolve(p);
    var data = DRIVE[filepath];
    if(typeof data == 'undefined') throw Error('File not found.');
    return data;
};

fs.existsSync = function(p) {
    var filepath = path.resolve(p);
    return typeof DRIVE[filepath] !== 'undefined';
};

fs.statSync = function(p) {
    var filepath = path.resolve(p);
    var res = DRIVE[filepath];
    if(typeof res == 'undefined') throw Error('File not found.');

    var stats = new fs.Stats();
    if(res === null) stats._isDir = true;
    else stats._isFile = true;
    return stats;
};

fs.realpathSync = function(p) {
    return path.resolve(p);
};

fs.mount = function(mp, url, callback) {

};

fs.mountSync = function(mp, layer) {
    if(mp[mp.length - 1] != path.sep) mp += path.sep;
    for(var rel in layer) {
        var curr = '';
        var filepath = path.resolve(mp + rel);
        var parts = filepath.split(path.sep);
        if(parts.length > 2) {
            for(var i = 1; i < parts.length - 1; i++) {
                curr += path.sep + parts[i];
                DRIVE[curr] = null; // Means "directory".
            }
        }
        DRIVE[filepath] = layer[rel];
    }
};
