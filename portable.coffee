
minify = (file) ->
  uglify = require 'uglify-js'
  file.raw = uglify.minify(file.raw, fromString: true).code

  # Because `portable.js` evaluates to nothing is wrapped in lambda function, so we wrap it here instead.
  if file.filepath.match 'portable\.js'
    file.raw = "(function(process){#{file.raw}})"


# > pjs layers
module.exports =
  dest: './build'

  layer:
    lib:
      src: './lib'
      glob: '**/*.js'
      transform: ['.+\.js$', minify]
    libmini:
      src: './libmini'
      glob: '**/*.js'
      transform: ['.+\.js$', minify]
    libmicro:
      src: './libmicro'
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
