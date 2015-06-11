`portable.js` comes in two flavors.

A stripped down `portable.js` version, which has just enough functionality to do web development with `npm` packages.

Mini-package. What do you get:

 - `require` and `fs.readFileSync`
 - Full support for loading `npm` modules from `/node_modules` folders.
 - Split you app in bundles and load new files when required using `nodefs.volume.mount()`.
 - Your app will not be exposed to the global, `window`, variable.
 - You also get `util.inherits` and `util.extend` utilities.
 
 
## How it works

If you know Node.js well, the best way to see how it works is to open the example file at `/example/index.html`.

 - different `require` in Browserify, Webpack, RequireJS.
 - File system + node.js in browser
 - `module.js` and `require` work out of the box


    var fs = process.require('fs'); 
    fs.readdirSync('/');
    // [ "lib", "tmp", "usr" ]
    
    fs.readdirSync('/lib');
    // [ "assert.js", "buffer.js", "events.js", "fs.js", "http.js", "module.js", ...
    
    
    process.require('util').isString("some string")
    
How is `portable.js` different from other module loaders for the browser? Modules is JavaScript are an abstraction, they
don't necessarily map 1:1 to files, thus module loaders have to come up with their way of structuring and loading modules.
Node.js has chosen to define a module to be every file you `require`, so in Node.js modules do map 1:1 to your file 
system. Portable.js uses (almost unmodified) the same code for module loading as Node.js.
        
# TODOs

 1. Run `portable.js` as a sandbox for node.js scripts:
    1. Run `portable.js` in separate `child_process`.
    2. Evaluate it use `vm` with some restrictive sandbox.
    3. Run the scripts inside `portable.js` with virtual read-only `fs`, and configure what functionality of other system modules to expose.

`portable.js` should be distributed as a single file as well?

Allow users to use any module transport: http://wiki.commonjs.org/wiki/Modules/Transport

Async `require`: allow users to implement their own async require.
https://github.com/amdjs/amdjs-api/blob/master/require.md

## License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>