var fs = require('fs');


console.log("__filename, __dirname");
console.log(__filename, __dirname);

console.log("fs.readdirSync('/')");
console.log(fs.readdirSync('/'));

console.log("fs.readdirSync('/lib')");
console.log(fs.readdirSync('/lib'));

