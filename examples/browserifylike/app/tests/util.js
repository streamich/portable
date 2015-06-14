var assert = require('assert');
var util = require('util');


var a = {key: 'value'};
var b = {aga: 123};


var c = util.extend({}, a, b);
assert.deepEqual(c, {key: 'value', aga: 123}, 'util.extend()');



