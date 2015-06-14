var http = require('http');


var opts = {
    host: 'localhost',
    port: '1777',
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
};
var req = http.request(opts, function(res, r) {
    console.log(r);
    console.log(res);
    console.log("Got response: " + res.statusCode);
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});
req.end();