var cli = require('cli');
var log = require('./log');
var commands = [
    'all',
    'paths',
    'layer',
    'merge',
    'bundle',
];
cli.parse({
    '--dont-minify': ['m', 'Disable global minification'],
    verbose: ['v', 'Aggressively print logs to console'],
    debug: ['', 'Output debug info']
}, commands);
cli.main(function (args, options) {
    try {
        if (cli.command) {
            if (commands.indexOf(cli.command) < 0)
                throw Error('Invalid command: ' + cli.command);
            var cmd = require('./command/' + cli.command + '.js');
            cmd(args, options);
        }
        else {
            log.error('Command not found: ' + cli.command);
        }
    }
    catch (e) {
        log.error(e);
        if (options.debug) {
            console.log(e.stack || e);
        }
    }
});
