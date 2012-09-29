module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/* <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          'src/dancer.js',
          'src/support.js',
          'src/kick.js',
          'src/adapterWebkit.js',
          'src/adapterMoz.js',
          'src/adapterFlash.js',
          'lib/fft.js',
          'lib/flash_detect.js'
        ],
        dest: 'dancer.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'dancer.js'],
        dest: 'dancer.min.js'
      }
    },
    lint: {
      files: [
        'src/dancer.js',
        'src/support.js',
        'src/kick.js',
        'src/adapterWebkit.js',
        'src/adapterMoz.js',
        'src/adapterFlash.js'
      ]
    },
    jshint: {
      options: {
        expr: true
      }
    },
    watch: {
      scripts: {
        files: '<config:concat.dist.src>',
        tasks: 'lint concat min'
      }
    }
  });

  grunt.registerTask('default', 'lint concat min');

};
