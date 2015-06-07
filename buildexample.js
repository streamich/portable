var fs = require('fs');
var UglifyJS = require("uglify-js");


var lib = {};
var dir = __dirname + '/lib';
fs.readdirSync(dir).forEach(function(file) {
    if(!file) return;
    var filepath = dir + '/' + file;
    //if(fs.statSync(filepath).isFile()) lib[file] = fs.readFileSync(filepath).toString();

    if(file == 'portable.js') { // Because it evaluates to nothing.
        if(fs.statSync(filepath).isFile()) lib[file] = fs.readFileSync(filepath).toString();
    } else {
        if (fs.statSync(filepath).isFile()) lib[file] = UglifyJS.minify(filepath).code;
    }
});

var volumes = {
    '/lib': lib,
    '/usr': {
        'test.js': 'require("hello-world").log();\n',
        'node_modules/hello-world/package.json': JSON.stringify({
            "name": "hello-world",
            "version": "1.0.0",
            "main": "index.js"
        }),
        'node_modules/hello-world/index.js': 'exports.log = function() {\nalert("Hello world!");\n}'
    }
};

var process = {
    platform: 'browser',
    env: {

        // Not necessary.
        //HOME: '/usr',
        //NODE_PATH: '/usr',

        PWD: '/usr'
    },
    argv: ['/usr/test.js'],
    drives: volumes
};



var lines = [];
lines.push('<script>\n');
lines.push('var process = ' + JSON.stringify(process, null, 4) + ';\n');
lines.push('eval(process.drives["/lib"]["portable.js"])(process);\n');
lines.push('</script>');


var out_dir = __dirname;
fs.writeFileSync(out_dir + '/example/index.html', lines.join('\n') + '\n');
//fs.writeFileSync(out_dir + '/portable.js', lines.join('\n') + '\n');

//require('./portable.js');