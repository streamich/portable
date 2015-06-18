/// <reference path="typing.d.ts" />
import log = require('./log');
import manifeset = require('./manifest');
import bundle = require('./bundle');
import build = require('./build');
import file = require('./file');
import https = require('https');
import fs = require('fs');
var express = require('express');
var compression = require('compression');
var cors = require('cors');


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

        var privateKey  = fs.readFileSync(__dirname + '/../ssl/server.key', 'utf8');
        var certificate = fs.readFileSync(__dirname + '/../ssl/server.crt', 'utf8');
        var credentials = {key: privateKey, cert: certificate};

        var app = this.app = express();
        app.use(cors());
        app.use(compression());

        app.get('/', this.onRouteIndex.bind(this));
        app.get('/layers/:layer', this.onRouteLayers.bind(this));
        app.get('/bundles/:bundle', this.onRouteBundles.bind(this));

        var httpsServer = https.createServer(credentials, app);
        httpsServer.listen(this.conf.port);

        var host = 'https://127.0.0.1:' + this.conf.port;
        log.info(host);

        for(var lname in this.man.layers.layers) {
            var mylayer = this.man.layers.getLayer(lname);
            mylayer.build();
            mylayer.watch();

            log.info(host + '/layers/' + mylayer.name + '.json');
        }

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


            log.info(host + '/bundles/' + mybundle.name + '.js');
        }
    }

    onRouteIndex(req, res) {
        var out = JSON.stringify(['/layers', '/bundles']);
        res.end(out);
    }

    removeExtension(name) {
        var pos = name.lastIndexOf('.');
        if(pos > -1) return name.substr(0, pos);
        else return name;
    }

    onRouteLayers(req, res) {
        var lname = this.removeExtension(req.params.layer);
        var mylayer = this.man.layers.getLayer(lname);
        if(!mylayer) return res.end('');

        res.set({
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(mylayer.cache));
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

