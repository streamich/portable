var log = require('./log');
var Builder = (function () {
    function Builder() {
    }
    Builder.buildLayers = function (man, layers) {
        if (!layers)
            layers = man.layers;
        for (var lname in layers.layers) {
            var mylayer = layers.getLayer(lname);
            log.info('Building layer: ' + lname);
            mylayer.build();
            var filepath = mylayer.write(man.destinationFolder);
            log.info('Saving layer: ' + filepath);
        }
    };
    Builder.mergeLayers = function (man) {
    };
    Builder.buildBundles = function (man, bundles) {
        for (var bname in bundles.bundles) {
            var mybundle = bundles.bundles[bname];
            mybundle.build();
        }
    };
    Builder.prototype.watch = function () {
    };
    return Builder;
})();
exports.Builder = Builder;
