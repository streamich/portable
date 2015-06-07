
# > pjs layers
module.exports =
  dest: './build'

  layers:

    # The all-inclusive `portable.js`
    lib:
      base: './lib'
      globs: [
        '**/*.js'
      ]
      minify: false
      dest: './dist'

    # The real-life `portable.js`
    libmin:
      base: './libmin'
      globs: [
        '**/*.js'
      ]
      minify: false
      dest: './dist'

    # The CLI tool.
    clisrc:
      base: './src'
      globs: [
        '**/*.js'
      ]
      minify: false

    clinode:
      base: './node_modules'
      globs: [
        '!(cli)/**/*.+(js|json)'
        'cli/*.+(js|json)'
        'cli/!(examples)/**/*.+(js|json)'
      ]
      minify: false

    example:

      # json -- plaing JSON
      # commonjs/require -- module.exports returns JSON object
      # jsonp -- uses commonjs/require tricks to minimize paths
      format: 'json'

      base: './example'
      dest: './example'
      filename: 'volume.json'
      globs: [
        '**/*.js'
      ]
      minify: false

  merge:
    cli:
      layers: [
        ['', 'clinode'],
        ['node_modules', 'clisrc']
      ]

  package:
    cli:
      type: 'node'
      volumes: [
        ['/app', 'cli']
      ]
    example:
      dest: './example/app.js'
      type: 'browser'
      lib: 'libmin'
      argv: ['/app/example.js']
      env:
        PWD: '/app'
      volumes: [
        ['/app', 'example']
      ]
