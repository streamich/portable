function package_json(layer) {
    return JSON.stringify(layer, null, 2);
}
module.exports = package_json;
