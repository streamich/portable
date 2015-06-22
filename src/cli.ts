/// <reference path="typing.d.ts" />
import build_layers = require('./build-layers');
import build_drives = require('./build-drives');
import path = require('path');
import fs = require('fs');
var cli = require('cli');
var log = require('./log');


var commands = [
    'layer',
    'bundle',
    'server'
];

cli.parse({
    file:               ['f',       'portable.js config file location',         'string'],
    verbose:            ['v',       'Aggressively print logs to console'],
    debug:              ['',        'Output debug info'],
}, commands);

cli.main(function(args, options) {
    try {
        if(cli.command) {
            if(commands.indexOf(cli.command) < 0) throw Error('Invalid command: ' + cli.command);

            // First try to run the `portable-js` package that is installed in folder where manifest file is located,
            // if not found, run the command from the global package.
            var manifest_dir = '';
            if(options.file) {
                manifest_dir = path.dirname(options.file);
            } else {
                manifest_dir = process.cwd();
            }
            var command_dir = manifest_dir + '/node_modules/portable-js/src/command';
            if(!fs.existsSync(command_dir)) command_dir = __dirname + '/command';

            if(options.verbose) log.level = 'verbose';
            if(options.debug) log.level = 'silly';

            var cmd = require(command_dir + '/' + cli.command + '.js');
            cmd(args, options);
        } else {
            log.error('Command not found: ' + cli.command);
        }
    } catch(e) {
        log.error(e);
        if(options.debug) {
            console.log(e.stack || e);
        }
    }

});
