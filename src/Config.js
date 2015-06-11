var bundle = require('./bundle');
var Config = (function () {
    function Config() {
    }
    // A list of bundles to build.
    Config.getWorkingBundles = function (man, bundle_names) {
        if (!bundle_names || !bundle_names.length) {
            return man.bundles;
        }
        else {
            var bundles = new bundle.Collection;
            bundle_names.forEach(function (bname) {
                var mybundle = man.bundles.getBundle(bname);
                if (!mybundle)
                    throw Error('Bundle not defined: ' + bname);
                bundles.addBundle(mybundle);
            });
            return bundles;
        }
    };
    return Config;
})();
module.exports = Config;
