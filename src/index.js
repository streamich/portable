var fs = require('fs');
var glob = require('glob');
var uglify = require('uglify-js');

var package = {};
function add_files(files) {
    files.forEach(function(file) {
        var relative = file.replace(dir, '.');

        var loader_raw = function(file) {
            return fs.readFileSync(file).toString();
        };

        var loader = function(file) {
            try {
                return uglify.minify(file).code;
            } catch(e) {
                return loader_raw(file);
            }
        };

        console.log(file);
        package[relative] = loader(file);
    });
}

var dir = '/code/jssh';
var files = glob.sync(dir + '/**/*.+(js|json|md|peg)');
//var files = glob.sync(dir + '/*.+(js|json|md)');

add_files(files);


var output = 'archive.json';
console.log(package);
fs.writeFileSync(output, JSON.stringify(package, null, 2));