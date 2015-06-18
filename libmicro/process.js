
process.pwd = process.env.PWD || '/';
process.cwd = function() {
    return process.pwd;
};
process.chdir = function(dir) {
    process.pwd = dir;
};


// io.js also has `process.js`.
module.exports = process;
