/// <reference path="../typing.d.ts" />
var fs = require('fs');
var LoaderRaw = (function () {
    function LoaderRaw() {
    }
    LoaderRaw.prototype.load = function (file) {
        return fs.readFileSync(file).toString();
    };
    return LoaderRaw;
})();
module.exports = LoaderRaw;
