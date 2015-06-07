
function r(val) {
    return function() { return val; };
}

require('util').extend(exports, {
    endianness: r('LE'),
    hostname: function () {
        if (typeof location !== 'undefined') {
            return location.hostname
        }
        else return '';
    },
    loadavg: r([]),
    uptime: r(0),
    freemem: r(Number.MAX_VALUE),
    totalmem: r(Number.MAX_VALUE),
    cpus: r([{model: '', speed: 1, times: {user: 0, nice: 0, sys: 0, idle: 0, irq: 0}}]), // We must have at least on CPU.
    type: r('Browser'),
    release: function () {
        if (typeof navigator !== 'undefined') {
            return navigator.appVersion;
        }
        return '';
    },
    networkInterfaces: exports.getNetworkInterfaces = r({}),
    arch: r('javascript'),
    platform: r('browser'),
    tmpdir: r('/tmp'),
    EOL: '\n'
});
