var fs = require('fs');


var lib = {};
var dir = __dirname + '/lib';
fs.readdirSync(dir).forEach(function(file) {
    if(!file) return;
    var filepath = dir + '/' + file;
    if(fs.statSync(filepath).isFile()) lib[file] = fs.readFileSync(filepath).toString();
});

var volume = {};
var dirapp = __dirname + '/sample-app';
fs.readdirSync(dirapp).forEach(function(file) {
    if(!file) return;
    var filepath = dirapp + '/' + file;
    if(fs.statSync(filepath).isFile()) volume[file] = fs.readFileSync(filepath).toString();
});

var volumes = {
    '/lib': lib,
    '/usr': volume,
    '/tmp': {}
};

var process = {
    expose: true,
    platform: 'browser',
    env: {

        // Not necessary.
        //HOME: '/usr',
        //NODE_PATH: '/usr',

        PWD: '/usr'
    },
    argv: ['/usr/app.js'],
    drives: volumes
};



var lines = [];
lines.push('<script>\n');
lines.push('(function(process) { eval(process.drives["/lib"]["portable.js"])(process); })(' +
    JSON.stringify(process, null, 4) + ');\n');
lines.push('</script>\n');


var out_dir = __dirname;
fs.writeFileSync(out_dir + '/build/test.html', lines.join('\n') + '\n');
//fs.writeFileSync(out_dir + '/portable.js', lines.join('\n') + '\n');

//require('./portable.js');