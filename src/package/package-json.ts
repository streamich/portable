

function package_json(layer) {
    return JSON.stringify(layer, null, 2);
}

export = package_json;