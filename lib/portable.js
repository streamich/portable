//"use strict";


(function(process) {
    process.global = this.global = this;

    function startup(require) {

        require('shim-object-keys');
        require('process');

        // Mount the /lib drive and any user drives to `fs`.
        var nodefs = require('nodefs');
        for(var mp in process.drives) nodefs.volume.mount(mp, process.drives[mp]);

        //startup.globals();

        var Module = require('module');

        // TODO: Do we need this?
        process.require = Module._load;

        Module.runMain();
    }

    // TODO: Do we need this?
    //startup.globals = function() {
        //global.process = process;
        //global.global = global;
        //global.GLOBAL = global;
        //global.root = global;
        // Normally we don't need buffer on the web... TODO: Shim it? Make users require it explicitly if they need it?
        //global.Buffer = core_require('buffer').Buffer;
    //};

    var runInThisContext = eval;
    var libVolume = '/lib';

    // `NM` for `NativeModule`.
    function NM(id) {
        this.filename = id + '.js';
        this.id = id;
        this.exports = {};
        this.loaded = false;
    }

    NM._cache = {};

    NM.require = function(id) {
        if(id == 'nm') return NM;

        var cached = NM.getCached(id);
        if(cached) return cached.exports;

        if(!NM.exists(id)) throw Error('Not found: "' + id + '"');
        //if(!NM.exists(id)) throw new Error('No such native module ' + id);

        var nm = new NM(id);
        nm.cache();
        nm.compile();
        return nm.exports;
    };

    NM.getCached = function(id) {
        return NM._cache[id];
    };

    NM.getSource = function(id) {
        return process.drives[libVolume][id + '.js'];
    };

    NM.wrap = function(script) {
        return NM.wrapper[0] + script + NM.wrapper[1];
    };

    NM.exists = function(id) {
        return !!NM.getSource(id);
    };

    NM.wrapper = [
        '(function (exports, require, module, __filename, __dirname, process) { ',
        '\n});'
    ];

    NM.prototype.compile = function() {
        var source = NM.getSource(this.id);
        source = NM.wrap(source);
        var fn = runInThisContext(source);
        fn(this.exports, NM.require, this, this.filename, libVolume, process);
        this.loaded = true;
    };

    NM.prototype.cache = function() {
        NM._cache[this.id] = this;
    };

    startup(NM.require);

});

