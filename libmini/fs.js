var path = require('path');
var util = require('util');


// fs.statSync
// fs.realpathSync
// fs.readFileSync


//var LS = typeof localStorage != 'undefined' ? localStorage : {};
var DRIVE = {};

var fs = exports;
fs.DRIVE = DRIVE;


fs.Stats = function() {
    util.extend(this, {
        _isDir: false,
        _isFile: false
    });
};
util.extend(fs.Stats.prototype, {
    isDirectory: function() { return this._isDir; },
    isFile: function() { return this._isFile; }
});


fs.writeFileSync = function(p, data) {
    var filepath = path.resolve(p);
    DRIVE[filepath] = data;
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


fs.mountSync = function(mp, layer) {
    if(mp[mp.length - 1] != path.sep) mp += path.sep;
    for(var rel in layer) {
        var curr = '';
        var filepath = path.resolve(mp + rel);
        var parts = filepath.split(path.sep);
        if(parts.length > 2) {
            for(var i = 1; i < parts.length - 1; i++) {
                curr += path.sep + parts[i];
                fs.writeFileSync(filepath, null);
                //DRIVE[curr] = null; // Means "directory".
            }
        }
        fs.writeFileSync(filepath, layer[rel]);
        //DRIVE[filepath] = layer[rel];
    }
};

// TODO: cache url, load each url only once...
fs.mount = function(mp, url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if(req.status == 200) {
                try {
                    var layer = JSON.parse(req.responseText);
                    fs.mountSync(mp, layer);
                    callback(null, layer);
                } catch(e) {
                    callback(e);
                }
            } else callback(Error('Fetch error: ' + url));
        }
    };
    req.send(null);
};
