var assert = require('assert');
var Readable = require('stream').Readable;
var util = require('util');
var Buffer = require('buffer').Buffer;



function Counter(opt) {
    Readable.call(this, opt);
    this._max = 3;
    this._index = 1;
}
util.inherits(Counter, Readable);

Counter.prototype._read = function() {
    var i = this._index++;
    if (i > this._max)
        this.push(null);
    else {
        var str = '' + i;
        var buf = new Buffer(str, 'ascii');
        this.push(buf);
    }
};


var counter = new Counter;
counter.on('data', function(data) {
    console.log(data.toString());
});
