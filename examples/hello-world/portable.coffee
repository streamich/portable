
dest: './build'

layer:
  app:
    src: './app'
    globs: ['**/*.+(js|json)']

bundle:
  app:
    type: 'browser'
    props:
      argv: ['/app/hello.js']
    volumes: [
      ['/app', 'app']
    ]
