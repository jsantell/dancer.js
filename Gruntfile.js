module.exports = function(grunt) {

  var banner = '/*\n' +
               ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
               ' * <%= pkg.homepage %>\n' +
               ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
               ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
               ' */\n';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: banner
      },
      build: {
        src: [
          'src/dancer.js',
          'src/support.js',
          'src/kick.js',
          'src/adapterWebAudio.js',
          'src/adapterMoz.js',
          'src/adapterFlash.js',
          'lib/fft.js',
          'lib/flash_detect.js'
        ],
        dest: 'dancer.js'
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        src: ['dancer.js'],
        dest: 'dancer.min.js'
      }
    },
    watch: {
      scripts: {
        files: '<config:concat.dist.src>',
        tasks: 'concat min'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat','uglify']);

};
