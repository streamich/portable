
minify = (file) ->
  # Because `portable.js` evaluates to nothing, so `uglify` just returns an empty file, so we don't minify it.
  if not file.filepath.match 'portable\.js'
    uglify = require 'uglify-js'
    file.raw = uglify.minify(file.raw, fromString: true).code


# > pjs layers
module.exports =
  dest: './build'

  layer:
    lib:
      src: './lib'
      glob: '**/*.js'
      transform: ['.+\.js$', minify]
    libmin:
      src: './libmin'
      glob: '**/*.js'
      transform: ['.+\.js$', minify]

    # The CLI tool.
    clisrc:
      src: './src'
      glob: '**/*.js'
      transform: ['.+\.js$', 'uglify']
    clinode:
      src: './node_modules'
      glob: [
        '!(cli)/**/*.+(js|json)'
        'cli/*.+(js|json)'
        'cli/!(examples)/**/*.+(js|json)'
      ]

  merge:
    cli:
      layers: [
        ['clisrc',    'src'],
        ['clinode',   'node_modules']
      ]

  bundle:
    cli:
      target: 'node'
      volumes: [
        ['/portable', 'cli']
      ]
      props:
        main: '/portable/src/cli.js'

  server:
    port: 1777
