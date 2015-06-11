var manifest = require('../manifest');
var server = require('../server');
var Config = require('../Config');
function cmd_server(args, options) {
    var man = manifest.Manifest.readFile(options.file);
    var bundles = Config.getWorkingBundles(man, args);
    var myserver = new server.Server;
    myserver.setManifest(man);
    myserver.setBundles(bundles);
    myserver.start();
    console.log('Press (Ctrl + C) to exit.');
}
module.exports = cmd_server;
