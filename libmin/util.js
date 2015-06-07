'use strict';

/**
 * Just like Node.js `util` but without the stuff we don't need in a browser.
 */

exports.inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
};

exports.extend = function extend(origin, add) {
    if (!origin || (typeof origin != 'object')) origin = {};
    if (!add || (typeof add != 'object')) add = {};

    for(var prop in add) origin[prop] = add[prop];
    if(arguments.length > 2) {
        var args = [].slice.call(arguments, 1);
        args[0] = origin;
        return extend.apply(this, args);
    } else return origin;
};
