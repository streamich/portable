var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../typing.d.ts" />
var Transform = require('./Transform');
var uglify = require('uglify-js');
var LoaderJs = (function (_super) {
    __extends(LoaderJs, _super);
    function LoaderJs() {
        _super.apply(this, arguments);
    }
    LoaderJs.prototype.process = function (data) {
        // TODO: Do error checking here.
        return uglify.minify(data, { fromString: true }).code;
    };
    return LoaderJs;
})(Transform);
module.exports = LoaderJs;
