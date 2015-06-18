var fs = require('fs');
var extend = require('../util/extend');
var volpath = __dirname + '/../../build/libmini.json';
try {
    var lib_json = fs.readFileSync(volpath).toString();
    var lib = JSON.parse(lib_json);
}
catch (e) {
    throw Error('Could not find library volume: ' + volpath);
}
function bundle_browser_mini(b, props) {
    var volumes = {
        '/lib': lib
    };
    b.conf.volumes.forEach(function (volume) {
        volumes[volume[0]] = b.layers.getLayer(volume[1]).toJson();
    });
    var env = {
        PWD: '/usr'
    };
    if (props.env) {
        env = extend(env, props.env);
    }
    var process = {
        platform: 'browser',
        env: env,
        argv: props.argv ? props.argv : ['/usr/index.js'],
        drives: volumes
    };
    if (props.expose)
        process.expose = true;
    var lines = [];
    lines.push('(function(process) { eval(process.drives["/lib"]["portable.js"])(process); })(' + JSON.stringify(process, null, 4) + ');\n');
    var out = lines.join('');
    return out;
}
module.exports = bundle_browser_mini;
