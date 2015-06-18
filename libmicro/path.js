// path.sep
// path.resolve
// path.basename
// path.dirname
// path.extname



// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
    var res = [];
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];

        // ignore empty parts
        if (!p || p === '.')
            continue;

        if (p === '..') {
            if (res.length && res[res.length - 1] !== '..') {
                res.pop();
            } else if (allowAboveRoot) {
                res.push('..');
            }
        } else {
            res.push(p);
        }
    }

    return res;
}


// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;


function posixSplitPath(filename) {
    return splitPathRe.exec(filename).slice(1);
}


exports.resolve = function() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = (i >= 0) ? arguments[i] : process.cwd();

        // Skip empty and invalid entries
        if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
        } else if (!path) {
            continue;
        }

        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path[0] === '/';
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeArray(resolvedPath.split('/'),
        !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};


exports.dirname = function(path) {
    var result = posixSplitPath(path),
        root = result[0],
        dir = result[1];

    if (!root && !dir) {
        // No dirname whatsoever
        return '.';
    }

    if (dir) {
        // It has a dirname, strip trailing slash
        dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
};


exports.basename = function(path, ext) {
    var f = posixSplitPath(path)[2];
    // TODO: make this comparison case-insensitive on windows?
    if (ext && f.substr(-1 * ext.length) === ext) {
        f = f.substr(0, f.length - ext.length);
    }
    return f;
};


exports.extname = function(path) {
    return posixSplitPath(path)[3];
};

exports.sep = '/';
exports.delimiter = ':';
