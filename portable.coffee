
# > pjs layers
module.exports =
  dest: './build'

  layer:

    # The all-inclusive `portable.js`
    lib:
      base: './lib'
      globs: [
        '**/*.js'
      ]

    # The real-life `portable.js`
    libmin:
      base: './libmin'
      globs: [
        '**/*.js'
      ]

    # The CLI tool.
    clisrc:
      base: './src'
      globs: [
        '**/*.js'
      ]

    clinode:
      base: './node_modules'
      globs: [
        '!(cli)/**/*.+(js|json)'
        'cli/*.+(js|json)'
        'cli/!(examples)/**/*.+(js|json)'
      ]

    example:

      # json -- plaing JSON
      # commonjs/require -- module.exports returns JSON object
      # jsonp -- uses commonjs/require tricks to minimize paths
#      format: 'json' # This should go to bundles.

      base: './example/app'
      filename: 'example.json'
      globs: [
        '**/*.js'
      ]
      # Collection of regexes to transform functions.
      transform: [
        # Regexp should be for the relative path.
        # A list of transform functions, if string, loaded from `portable-transform-<string>` package.
        # If package not found loaded from `./src/transform/transform-<string>.js`.
        ['.+\.js$', (file) -> file.raw += '\n// Some comment...']
        # Example:
#        ['.+\.ts$', [
#          'compile-typescript'
#          'minify'
#          (file) -> file.raw = '#! /bin/sh\n' + file.raw
#        ]]
      ]

  merge:
    cli:
      layers: [
        ['clinode', ''],
        ['clisrc', 'node_modules']
      ]

  bundle:
#    cli:
#      type: 'node'
#      volumes: [
#        ['/app', 'cli']
#      ]
    example:
      type: 'browser'
#      lib: 'libmin'
#      argv: ['/app/example.js']
#      env:
#        PWD: '/app'
      volumes: [
        ['/app', 'example']
      ]
