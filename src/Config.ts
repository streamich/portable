import manifest = require('./manifest');
import bundle = require('./bundle');


class Config {

    // A list of bundles to build.
    static getWorkingBundles(man: manifest.Manifest, bundle_names?: string[]) {
        if(!bundle_names || !bundle_names.length) { // All bundles.
            return man.bundles;
        } else { // A list of bundles is specified.
            var bundles = new bundle.Collection;
            bundle_names.forEach((bname) => {
                var mybundle = man.bundles.getBundle(bname);
                if(!mybundle) throw Error('Bundle not defined: ' + bname);
                bundles.addBundle(mybundle);
            });
            return bundles;
        }
    }

}

export = Config;