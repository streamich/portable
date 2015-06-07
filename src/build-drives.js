/// <reference path="./typing.d.ts" />
var Drive = require('./Drive');
var fs = require('fs');
var path = require('path');
var mkdir = require('./mkdir');
function build_drives(config, args, options, cmd) {
    var logger = console.log.bind(console);
    var dest = path.resolve("" + (config.dest ? config.dest : "./")) + "/";
    mkdir(dest);
    for (var name in config.drives) {
        logger('Bulding drives: ' + name);
        var dconfig = config.drives[name];
        var drive = new Drive;
        if (!(dconfig.layers instanceof Array) || (!dconfig.layers.length))
            throw Error('No layers provided for dirve: ' + name);
        var output = [];
        for (var i = 0; i < dconfig.layers.length; i++) {
            var layer = dconfig.layers[i];
            var layerfile = dest + layer + '.nodefs.json';
            var layerdata = fs.readFileSync(layerfile).toString();
            drive.addLayer(JSON.parse(layerdata));
        }
        //console.log(output);
        var drivefile = dest + name + ".nodefs.js";
        drive.write(drivefile);
        //var drivedata = output.join('\n');
        //fs.writeFileSync(drivefile, drivedata);
        logger('Saving drive: ' + drivefile);
    }
}
module.exports = build_drives;
