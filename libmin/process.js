var util = require('util');
var EventEmitter = require('events');


// Make process to be an `EventEmitter`.
var EEp = EventEmitter.prototype;
for(var prop in EEp)
    if(typeof EEp[prop] == 'function') process[prop] = EEp[prop].bind(process);
EventEmitter.init.call(process);


// If explicitly requested by user, `process` is exposed to some global variable.
//if(process.expose) {
//    process.global['process'] = process;
//}


util.extend(process, {
    pwd: process.env.PWD || '/',
    cwd: function() {
        return process.pwd;
    },
    chdir: function(dir) {
        process.pwd = dir;
    },

    nextTick:   function(callback) { setTimeout(callback, 0); },
    //assert:     function(x, msg) { if(!x) throw Error(msg || 'assertion error'); },

    // This is used in `fs`. Do we need it?
    //getuid:     function() { return 0; },
    //getgid:     function() { return 0; }

    //umask: function() { return 0; }
});

// io.js also has `process.js`.
module.exports = process;
