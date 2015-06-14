

module.exports =
  dest: './build'
  layer:
    app:
      src: './app'
      glob: '**/*.js'
  bundle:
    app:
      target: 'browser-full'
      props:
        argv: ['/app/index.js']
        env: PWD: '/app'
        modules: [
#          'http'
        ]
      volumes: [
        ['/app', 'app']
      ]
#  server:
#    port: 1777
