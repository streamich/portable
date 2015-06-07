/// <reference path="typing.d.ts" />
var fs = require('fs');
var Drive = (function () {
    function Drive(mountpoint) {
        if (mountpoint === void 0) { mountpoint = "./"; }
        this.layers = [];
        /**
         * Mountpoint as specified per layer.
         */
        this.mountpoints = [];
        this.mp = mountpoint;
    }
    Drive.prototype.addLayer = function (layer, mp) {
        this.layers.push(layer);
        this.mountpoints.push(mp ? mp : this.mp);
    };
    Drive.prototype.build = function () {
        var _this = this;
        var self = this;
        var output = [];
        output.push("var l = [];");
        output.push("var m = [];");
        this.layers.forEach(function (layer, i) {
            output.push('l[' + i + '] = ' + JSON.stringify(layer));
            output.push('m[' + i + '] = "' + _this.mountpoints[i] + '"');
        });
        return output.join("\n");
    };
    Drive.prototype.write = function (filename) {
        fs.writeFileSync(filename, this.build());
    };
    return Drive;
})();
module.exports = Drive;
