/// <reference path="typing.d.ts" />
var fs = require('fs');


class Drive {

    /**
     * Default mount point.
     */
    mp: string;

    layers = [];

    /**
     * Mountpoint as specified per layer.
     */
    mountpoints: string[] = [];

    constructor(mountpoint = "./") {
        this.mp = mountpoint;
    }

    addLayer(layer, mp?) {
        this.layers.push(layer);
        this.mountpoints.push(mp ? mp : this.mp);
    }

    build() {
        var self = this;

        var output = [];
        output.push("var l = [];");
        output.push("var m = [];");
        this.layers.forEach((layer, i) => {
            output.push('l[' + i + '] = ' + JSON.stringify(layer));
            output.push('m[' + i + '] = "' + this.mountpoints[i] + '"');
        });

        return output.join("\n");
    }

    write(filename) {
        fs.writeFileSync(filename, this.build());
    }

}

export = Drive;