var log = require('./log');
var Builder = (function () {
    function Builder() {
    }
    Builder.buildLayers = function (manifest) {
        var layer = require('./layer');
        var layers = {};
        for (var name in manifest.data.layers) {
            log.info('Bulding layer: ' + name);
            var mylayer = layers[name] = new layer.Layer(name);
            mylayer.setConfig(manifest.data.layers[name]);
            mylayer.addFilesByGlobs();
            var filepath = mylayer.write(manifest.destinationFolder);
            log.info('Saving layer: ' + filepath);
        }
    };
    Builder.mergeLayers = function (manifest) {
    };
    return Builder;
})();
exports.Builder = Builder;
