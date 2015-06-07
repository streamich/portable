/// <reference path="../typing.d.ts" />
var uglify = require('uglify-js');
var LoaderJs = (function () {
    function LoaderJs() {
    }
    LoaderJs.prototype.load = function (file) {
        return uglify.minify(file).code;
    };
    return LoaderJs;
})();
module.exports = LoaderJs;
