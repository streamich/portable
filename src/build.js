var log = require('./log');
var Builder = (function () {
    function Builder() {
    }
    Builder.buildLayers = function (man) {
        var layer = require('./layer');
        var layers = {};
        for (var name in man.data.layers) {
            log.info('Bulding layer: ' + name);
            var mylayer = layers[name] = new layer.Layer(name);
            mylayer.setConfig(man.data.layers[name]);
            mylayer.addFilesByGlobs();
            var filepath = mylayer.write(man.destinationFolder);
            log.info('Saving layer: ' + filepath);
        }
    };
    Builder.mergeLayers = function (man) {
    };
    Builder.buildBundles = function (man) {
        man.bundles.bundles.forEach(function (bundle) {
            bundle.build();
            bundle.write();
        });
    };
    Builder.prototype.watch = function () {
    };
    return Builder;
})();
exports.Builder = Builder;
