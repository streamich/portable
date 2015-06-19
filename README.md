# **portable.js**

`portable.js` bundles your node.js and browser apps into a single or multiple `.js` files.
 
*Don't reinvent the wheel!* `portable.js` gives you **exactly** the same `require` function as node.js.

# Getting started

*TLDR:* You create a manifest file `portable.js` then run `portable.js bundle` command in your terminal and your `.js` 
app is ready.

Read this [introduction tutorial](https://github.com/streamich/portable-example) if you are using `portable.js`
for the first time.

# Manifest

`portable.js` needs a manifest file that defines how to bundle your project. The default name of the manifest file is
`poartable.js`. You can overwrite it with the `--file` command line option:

    portable.js --file ./some-other-file.json
    
The manifest file can be either `.js` or `.json` file. In case it is `.js` it should export an object using 
`module.exports` syntax. If `--file` is not specifies `portable.js`, `portable.config.js`, `portable.json`, and
`portable.config.json` will be tried in that order.

A typical `portable.js` manifest could look like this:

```javascript
module.exports = {
    dest: './build',            // Folder where results are saved.
    layer: {                    // Layer to build.
        "layer-name": {         // Layer name.
            src: './src',       // Folder where to look for files.
            glob: [             // Globs to use to match files.
                '*.js',
                '**/*.md'
            ],
            transform: [        // Transforms to apply to files matched by regex.
                ['.*\.js$', 'uglify'],
                ['.*\.md$', function(file) { /* ... */ }]
            ],
        },
        "another-layer": {
            src: './node_modules',
            glob: '**/*.+(js|json)'
        }
    },
    merge: {                    // Merge multiple layers to create another layer.
        "third-layer": {        // Layer names.
            layers: [           // Layers to merge.
                ['layer-name', 'src'],      // Layer name and path where to insert it.
                ['another-layer', 'node_modules'],
            ]
        }
    },
    bundle: {                   // Bundles to build.
        "my-app": {             // Bundle name.
            target: 'browser-micro',    // Bundling function to use.
            volumes: [                  // Layers to use in the bundle.
                ['/usr', 'layer-name']  // Mounting point and layer name.
            ],
            props: {                    // Properties to provide to the bundling function.
                argv: ['/usr/src/index.js']     // Main file to run.
            }
        }
    },
    server: {                   // Server options when run `server` command.
        port: 1234              // Port to which to bind a server.
    }
};
```

# Layers

Layers are simple `.json` files with keys being file relative paths and values being the contents of the files. 
Here is a basic example:

```json
{
    "dir/index.js": "console.log('Hello world!')"
}
```

Relative paths always use forward slash `/` as path separator.

Use the following parameters to define your layers:

```typescript
interface ILayersConfig {
    src?: string;                       // Root dir where to look for files.
    glob: string|string[];              // Globs to apply.
    filename?: string;                  // Optional custom file name for the layer.
    transform?: string[]|string[][];    // Transforms to apply to source code of files in this layer.
}
```

 - `src` -- the root directory where to start looking for files.
 - `glob` -- a single glob or an array of globs to match files that will be included in the layer.
 - `filename` -- a custom file name under which to save your layer, otherwise `<layer-name>.json` will be used.
 - `transform` -- a single transform or a an array of transforms that will be applied to each file in the layer. A
 transform is a 2-tuple, where first argument is a regular expression to filter out files which will be transformed; and
 the second argument if a transform function that receives a `File` object. In case, the second argument is a string
 `portable.js` will use an already defined function that this string maps to *(TODO: describe how it works)*.
 
*TODO: in future transform functions will map to `npm` modules named as `portable-transform-<name>`.*
 
Example:
 
```javascript
{
    layer: {
        'layer-name': {
            src: './lib',
            glob: '**/*.js',
            filename: 'custom_name.json',
            transform: [
                ['.*\.js$', 'uglify'],
                ['.*\.js$', function debug_global_const(file) {
                    file.raw = 'var __DEBUG__ = true;\n' + file.raw;
                }],
                ['.*\.js$', function add_shebang(file) {
                    file.raw = '#! /usr/bin/env node\n' + file.raw;
                }]
            ]
        }
        // More layers...
    }
}
```

# Bundles

The final output you create out of your layers are called *bundles*. Depending on what is you final goal (a browser app
or a node.js app) you use different bundling functions to create your bundles. You use `target` parameter to specify
the bundling function.
 
Bundle specification:

```typescript
interface IBundleConfig {
    target?: string;                // Specifies the type of the bundle to export, a name of the bundling function.
    volumes: string[][];            // List of 2-tuples [mountpoint, layer] to mount as `fs` folders.
    props: any;                     // Optional options to provide to the bundling function.
}
```

 - `target` -- the name of the bundling function.
 - `volumes` -- a list of 2-tuples that defines how your layers are mounted to `fs.js`.
 - `props` -- additional custom options that you can specify to a bundling function.
 
*TODO: in the future bundling functions will map to `npm` modules named as `portable-bundle-<target>`.*
 
Example:
 
```javascript
{
    bundle: {
        'bundle-name': {
            target: 'browser-micro',
            volumes: [
                ['/usr', 'layer-name']
            ],
            props: {}
        }
        // More bundles...
    }
}
```

There are five built-in bundling functions:

 - `browser-micro` -- The most minimal (about 3Kb when gzipped) bundle that has just enough to get `require` working.
 - `browser-mini` -- Similar to `browser-micro`.
 - `browser` -- Provides all possible node.js API in a browser environment.
 - `node` -- Packages a node.js app into a single `.js` file.
 - `none` -- Does nothing.

### `browser-micro`

A stripped down `portable.js` version, which has just enough functionality to do web development the node.js way with 
`npm` packages. It is the smallest distribution (at about 3KB) to get `require` function working.

What do you get:

 - `require` -- includes almost unmodified `module.js` module from node.js source code, which results in **exactly**
 the same require behaviour as you get in your node.js apps. So, full support for loading `npm` modules from
 `/node_modules` folders.
 - A stripped down `fs.js` module with `fs.readFileSync`, `fs.writeFileSync`, `fs.existsSync`, `fs.statSync`, and
 `fs.realpathSync` functions.
 - Extra `fs.mount` and `fs.mountSync` functions to mount layers to the file system. This allows you to split you app
 into layers, and load new layers on-demand.
 - `path.resolve`, `path.dirname`, `path.basename`, and `path.extname` functions in `path.js` module.
 
Custom options provided by `props` parameter:

 - `argv` -- an array where first argument specifies the file to be executed.
 - `env` -- environment variables that will be available through `process.env`.

# CLI usage

Build all layers:

    portable.js layer
    
Build specific layers:
    
    portable.js layer name1[ name2[ name3[ ...]]]
    
Build all bundles:

    portable.js bundle
    
Build specific bundles:

    portable.js bundle name1[ name2[ name3[ ...]]]
    
Start a watch server:

    portable.js server
    
Specify a custom config file using `--file` argument:

    portable.js --file ./config.js

# How it works

The best way to see how it works is to see the [example app](https://github.com/streamich/portable-example/blob/master/dist/app.js)
generated using the `browser-micro` target.

`portable.js` has a different approach then other `.js` packaging systems, like Webpack, Browserify, etc. Instead of
using static code analysis to *try* to determine what files to include in your app, `portable.js` simply ships your
app with a *virtual in-memory file system* and then uses the same code node.js does to resolve and require your dependencies.

It works as follows: `portable.js` emulates the same booting sequence that node.js does when it loads its standard
library before any of your code is executed.

First, the `process` variable is initialized. Then miscellaneous modules like, `util.js` and `events.js` are loaded.

Then node.js loads the file system `fs.js` module. At this point we mount the in-memory files defined in your *layers*, so
that they appear as regular files.

Finaly, before your code gets executed, node.js loads the `module.js` module, which creates the `require` function you use to
require your dependencies.

Now here is the trick: because `portable.js` apps ship with a virtual in-memory file system and a working `fs.js` module,
the `module.js` and `require` just simply work out of the gate, without any modifications. We simply use the stock
version of `module.js` taken from node.js source code. Thus you get the exact same `require` behavior in your browser as 
in your node.js apps.
   
# AMD `require`

portable.js does not provide AMD (Asynchronous Module Definition) style require, but you can build one yourself if you 
wish to.

If `require` is called with more than one argument the call is forwarded to the *asynchronous* require function
which you can define by overwriting `Module.async` static property like so:

```javascript
var Module = require('module');
Module.async = function(args, require, module) {
    // Your custom asynchronous require.
};
```

`Module.async` receives three arguments:
 
 - `args` -- the `arguments` list that was provided to the asynchronous require.
 - `require` -- the require function created for the module where the asynchronous require was called.
 - `module` -- the module object of the module where the asynchronous require was called.

Internally you can use `fs.mount` and `fs.mountSync` functions to load the necessary layers to create functionality like this:

```javascript
require('./feature.js', function(feature) {
    // ...
});
```

or

```javascript
require(['module1', 'module2'], function() {
    var module1 = require('module1');
    // ...
});
```

or however you image it.

*P.S.* Here you can find [why you would want to use AMD](http://requirejs.org/docs/whyamd.html) and here is a nice
summary [why you shouldn't use AMD](http://tomdale.net/2012/01/amd-is-not-the-answer/). In general, we are happy with
simply using `fs.mount`.

# TODOs

 1. Run `portable.js` as a sandbox for node.js scripts:
    1. Run `portable.js` in separate `child_process`.
    2. Evaluate it using `vm` with some restrictive sandbox.
    3. Run the scripts inside `portable.js` with virtual read-only `fs`, and configure what functionality of other system modules to expose.

`portable.js` should be distributed as a single file as well?

Make Webpack loaders work as transforms. Also, in code `fs.readFileSync` is available, so don't need them in `require`.

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