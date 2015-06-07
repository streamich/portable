(function(process) { eval(process.drives["/lib"]["portable.js"])(process); })({
    "expose": true,
    "platform": "browser",
    "env": {
        "PWD": "/usr"
    },
    "argv": [
        "/usr/app.js"
    ],
    "drives": {
        "/lib": {},
        "/app": {
            "hello-world.js": "console.log(\"Hello world!\");\n\n// Some comment..."
        }
    }
});
