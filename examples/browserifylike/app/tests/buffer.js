var assert = require('assert');
var buffer = require('buffer');
var Buffer = buffer.Buffer;


// Buffer.toString()
var str = 'qwerty';
var b = new Buffer(str);
assert.equal(b.toString(), str, 'Buffer.toString()');


// Buffer.length
assert.equal(b.length, str.length, 'Buffer.length');


// Buffer.write()
str2 = 'foo';
b.write(str2);
assert.equal(b.toString(), 'foorty', 'Buffer.write()');
