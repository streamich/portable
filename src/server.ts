/// <reference path="typing.d.ts" />
import log = require('./log');
import manifeset = require('./manifest');
import bundle = require('./bundle');
import build = require('./build');
import file = require('./file');
var express = require('express');
var compression = require('compression');


export class Server {

    app;
    man: manifeset.Manifest;
    bundles: bundle.Collection;

    conf: manifeset.IServerConfig;
    defaultPort = 1777;

    setManifest(man: manifeset.Manifest) {
        this.man = man;
        this.conf = man.data.server;
        if(!this.conf) this.conf = {};
        if(!this.conf.port) this.conf.port = this.defaultPort;
    }

    setBundles(bundles: bundle.Collection) {
        this.bundles = bundles;
    }

    start() {
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
        for(var bname in this.man.bundles.bundles) {
            var mybundle = this.man.bundles.getBundle(bname);
            mybundle.watch();
            mybundle.on('file:change', function(myfile: file.File) {
                log.info('Modified: ' + myfile.filepath);
            }.bind(this));
            mybundle.on('file:new', function(myfile: file.File) {
                log.info('Added: ' + myfile.filepath);
            }.bind(this));
            mybundle.on('file:delete', function(myfile: file.File) {
                log.info('Removed: ' + myfile.filepath);
            }.bind(this));
            log.info('http://127.0.0.1:' + this.conf.port + '/bundles/' + mybundle.name + '.js');
        }
    }

    onRouteIndex(req, res) {
        res.end(['/layers', '/bundles']);
    }

    onRouteLayers(req, res) {
        var lname = req.params.layer;
        res.end('layer ' + lname);
    }

    onRouteBundles(req, res) {
        var bname = req.params.bundle;

        // Remove extension, we don't really care what extension user specifies.
        var pos = bname.indexOf('.');
        if(pos > -1) {
            bname = bname.substr(0, pos);
        }

        var mybundle = this.man.bundles.getBundle(bname);

        if(!mybundle) {
            res
                .status(404)
                .set({'Content-Type': 'text'})
                .end('Could not find bundle: ' + bname);
            return;
        }

        res
            .set({'Content-Type': mybundle.mimeType})
            .end(mybundle.output);
    }

}

