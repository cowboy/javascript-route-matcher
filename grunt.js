/*global config:true, task:true*/
config.init({
  meta: {
    name: 'javascript-route-matcher',
    title: 'JavaScript Route Matcher',
    version: '0.1.0',
    description: 'A simple route matching / url building utility. Intended to be included as part of a larger routing library.',
    homepage: 'http://github.com/cowboy/javascript-route-matcher',
    author: '"Cowboy" Ben Alman',
    license: ['MIT', 'GPL'],
    copyright: 'Copyright (c) 2011 "Cowboy" Ben Alman',
    repository: 'git://github.com/cowboy/javascript-route-matcher.git',
    banner: '/* {{meta.title}} - v{{meta.version}} - {{today "m/d/yyyy"}}\n' +
            ' * {{meta.homepage}}\n' + 
            ' * {{{meta.copyright}}}; Licensed {{join meta.license}} */'
  },
  concat: {
    'dist/ba-routematcher.js': ['<banner>', '<file_strip_banner:lib/routematcher.js>']
  },
  min: {
    'dist/ba-routematcher.min.js': ['<banner>', 'dist/ba-routematcher.js']
  },
  test: {
    files: ['test/**/*.js']
  },
  lint: {
    files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
  },
  jshint: {
    options: {
      curly: true,
      //eqeqeq: true,
      immed: true,
      latedef: true,
      newcap: true,
      noarg: true,
      sub: true,
      undef: true,
      eqnull: true
    },
    globals: {
      exports: true
    }
  },
  uglify: {}
});

// Default task.
task.registerTask('default', 'lint:files test:files concat min');
