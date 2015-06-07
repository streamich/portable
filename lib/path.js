'use strict';


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

// returns an array with empty elements removed from either end of the input
// array or the original array if no elements need to be removed
function trimArray(arr) {
    var lastIndex = arr.length - 1;
    var start = 0;
    for (; start <= lastIndex; start++) {
        if (arr[start])
            break;
    }

    var end = lastIndex;
    for (; end >= 0; end--) {
        if (arr[end])
            break;
    }

    if (start === 0 && end === lastIndex)
        return arr;
    if (start > end)
        return [];
    return arr.slice(start, end + 1);
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


exports.normalize = function(path) {
    var isAbsolute = exports.isAbsolute(path),
        trailingSlash = path && path[path.length - 1] === '/';

    // Normalize the path
    path = normalizeArray(path.split('/'), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
        path = '.';
    }
    if (path && trailingSlash) {
        path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
};


exports.isAbsolute = function(path) {
    return path.charAt(0) === '/';
};


exports.join = function() {
    var path = '';
    for (var i = 0; i < arguments.length; i++) {
        var segment = arguments[i];
        if (typeof segment != 'string') {
            throw new TypeError('Arguments to path.join must be strings');
        }
        if (segment) {
            if (!path) {
                path += segment;
            } else {
                path += '/' + segment;
            }
        }
    }
    return exports.normalize(path);
};


exports.relative = function(from, to) {
    from = exports.resolve(from).substr(1);
    to = exports.resolve(to).substr(1);

    var fromParts = trimArray(from.split('/'));
    var toParts = trimArray(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
        }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
};


exports._makeLong = function(path) {
    return path;
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


exports.format = function(pathObject) {
    if (typeof pathObject != 'object') {
        throw new TypeError(
            "Parameter 'pathObject' must be an object, not " + typeof pathObject
        );
    }

    var root = pathObject.root || '';

    if (typeof root != 'string') {
        throw new TypeError(
            "'pathObject.root' must be a string or undefined, not " +
            typeof pathObject.root
        );
    }

    var dir = pathObject.dir ? pathObject.dir + exports.sep : '';
    var base = pathObject.base || '';
    return dir + base;
};


exports.parse = function(pathString) {
    if (typeof pathString != 'string') {
        throw new TypeError(
            "Parameter 'pathString' must be a string, not " + typeof pathString
        );
    }
    var allParts = posixSplitPath(pathString);
    if (!allParts || allParts.length !== 4) {
        throw new TypeError("Invalid path '" + pathString + "'");
    }
    allParts[1] = allParts[1] || '';
    allParts[2] = allParts[2] || '';
    allParts[3] = allParts[3] || '';

    return {
        root: allParts[0],
        dir: allParts[0] + allParts[1].slice(0, -1),
        base: allParts[2],
        ext: allParts[3],
        name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
    };
};


exports.sep = '/';
exports.delimiter = ':';
