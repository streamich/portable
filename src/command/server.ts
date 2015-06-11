/// <reference path="../typing.d.ts" />
import log = require('../log');
import layer = require('../layer');
import manifest = require('../manifest');
import path = require('path');
import mkdir = require('../util/mkdir');
import bundle = require('../bundle');
import server = require('../server');
import Config = require('../Config');


function cmd_server(args, options) {

    var man = manifest.Manifest.readFile(options.file);
    var bundles = Config.getWorkingBundles(man, args);

    var myserver = new server.Server;
    myserver.setManifest(man);
    myserver.setBundles(bundles);
    myserver.start();
    console.log('Press (Ctrl + C) to exit.')

}

export = cmd_server;
