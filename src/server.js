/// <reference path="typing.d.ts" />
var log = require('./log');
var build = require('./build');
var express = require('express');
var compression = require('compression');
var Server = (function () {
    function Server() {
        this.defaultPort = 1777;
    }
    Server.prototype.setManifest = function (man) {
        this.man = man;
        this.conf = man.data.server;
        if (!this.conf)
            this.conf = {};
        if (!this.conf.port)
            this.conf.port = this.defaultPort;
    };
    Server.prototype.setBundles = function (bundles) {
        this.bundles = bundles;
    };
    Server.prototype.start = function () {
        log.info('Starting server.');
        // Build all bundles on startupt.
        build.Builder.buildBundles(this.man, this.man.bundles);
        var app = this.app = express();
        app.use(compression());
        app.get('/', this.onRouteIndex.bind(this));
        app.get('/layers/:layer', this.onRouteLayers.bind(this));
        app.get('/bundles/:bundle', this.onRouteBundles.bind(this));
        app.listen(this.conf.port);
        log.info('http://127.0.0.1:' + this.conf.port);
        for (var bname in this.man.bundles.bundles) {
            var mybundle = this.man.bundles.getBundle(bname);
            mybundle.watch();
            mybundle.on('file:change', function (myfile) {
                log.info('Modified: ' + myfile.filepath);
            }.bind(this));
            mybundle.on('file:new', function (myfile) {
                log.info('Added: ' + myfile.filepath);
            }.bind(this));
            mybundle.on('file:delete', function (myfile) {
                log.info('Removed: ' + myfile.filepath);
            }.bind(this));
            log.info('http://127.0.0.1:' + this.conf.port + '/bundles/' + mybundle.name + '.js');
        }
    };
    Server.prototype.onRouteIndex = function (req, res) {
        res.end(['/layers', '/bundles']);
    };
    Server.prototype.onRouteLayers = function (req, res) {
        var lname = req.params.layer;
        res.end('layer ' + lname);
    };
    Server.prototype.onRouteBundles = function (req, res) {
        var bname = req.params.bundle;
        // Remove extension, we don't really care what extension user specifies.
        var pos = bname.indexOf('.');
        if (pos > -1) {
            bname = bname.substr(0, pos);
        }
        var mybundle = this.man.bundles.getBundle(bname);
        if (!mybundle) {
            res.status(404).set({ 'Content-Type': 'text' }).end('Could not find bundle: ' + bname);
            return;
        }
        res.set({ 'Content-Type': mybundle.mimeType }).end(mybundle.output);
    };
    return Server;
})();
exports.Server = Server;
