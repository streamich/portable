/// <reference path="../typing.d.ts" />
import fs = require('fs');


class LoaderRaw {

    load(file) {
        return fs.readFileSync(file).toString();
    }

}

export = LoaderRaw;