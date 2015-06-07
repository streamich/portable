/// <reference path="./typing.d.ts" />
import Drive = require('./Drive');
import fs = require('fs');
import path = require('path');
import mkdir = require('./mkdir');


function build_drives(config, args, options, cmd) {
    var logger = console.log.bind(console);

    var dest = path.resolve("" + (config.dest ? config.dest : "./")) + "/";
    mkdir(dest);

    for(var name in config.drives) {
        logger('Bulding drives: ' + name);

        var dconfig = config.drives[name];
        var drive = new Drive;

        if(!(dconfig.layers instanceof Array) || (!dconfig.layers.length))
            throw Error('No layers provided for dirve: ' + name);

        var output = [];

        for(var i = 0; i < dconfig.layers.length; i++) {
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
        //logger('Size: ' + drivedata.length);
        //logger('\n');
    }
}

export = build_drives;
