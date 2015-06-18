var fs = require('fs');
var extend = require('../util/extend');
var lib_dir = __dirname + '/../../lib/';
var lib_json = fs.readFileSync(__dirname + '/../../build/lib.json').toString();
var lib = JSON.parse(lib_json);
var modules_required = ['portable'];
function bundle_browser_full(b, props) {
    var regex = new RegExp('require\\\([\'\"]([a-zA-Z\-0-9_]+)[\'\"]\\\)', 'g');
    var regex2 = new RegExp('require\\\([\'\"]([a-zA-Z\-0-9_]+)[\'\"]\\\)');
    var exclude = ['nm'];
    var modules = modules_required.concat(props.modules ? props.modules : []);
    for (var i = 0; i < modules.length; i++) {
        var mod = modules[i];
        var js_source = fs.readFileSync(lib_dir + mod + '.js').toString();
        var matches = js_source.match(regex);
        if (!matches)
            continue;
        matches.forEach(function (match) {
            var mod_name = match.match(regex2)[1];
            if ((modules.indexOf(mod_name) == -1) && (exclude.indexOf(mod_name) == -1))
                modules.push(mod_name);
        });
    }
    var mylib = {};
    modules.forEach(function (mod) {
        mylib[mod + '.js'] = lib[mod + '.js'];
    });
    var volumes = {
        '/lib': mylib
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
        expose: true,
        platform: 'browser',
        env: env,
        argv: props.argv ? props.argv : ['/usr/index.js'],
        drives: volumes
    };
    var lines = [];
    lines.push('(function(process) { eval(process.drives["/lib"]["portable.js"])(process); })(' + JSON.stringify(process, null, 4) + ');\n');
    var out = lines.join('');
    return out;
}
module.exports = bundle_browser_full;
