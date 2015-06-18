
// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
var isArray = exports.isArray = Array.isArray;

function isBoolean(arg) {
    return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
    return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
    return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
    return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
    return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
    return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
    return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
    return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
    return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
    return isObject(e) &&
        (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
    return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
    return arg === null ||
        typeof arg === 'boolean' ||
        typeof arg === 'number' ||
        typeof arg === 'string' ||
        typeof arg === 'symbol' ||  // ES6 symbol
        typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
    return arg && typeof arg === 'object'
        && typeof arg.copy === 'function'
        && typeof arg.fill === 'function'
        && typeof arg.readUInt8 === 'function';
}
exports.isBuffer = isBuffer;



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
