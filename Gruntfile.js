module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var config = {
    srcDir: 'src',
    distDir: 'dist'
  };

function dateFormat(date, format) {
    format = format.replace("ss", (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()); 
    format = format.replace("mm", (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()); 
    format = format.replace("hh", (date.getHours() < 10 ? '0' : '') + date.getHours());     
    format = format.replace("DD", (date.getDate() < 10 ? '0' : '') + date.getDate()); 
    format = format.replace("MM", (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)); 
    format = format.replace("YYYY", date.getFullYear());
    return format;
  }

  var dirname = dateFormat(new Date(), "YYYYMMDDhhmmss");

  var tasksConfig = {
    config: config,
    clean: {
      dist: '<%= config.distDir %>'
    },
    copy: {
      index: {
        files: [
          { dest: '<%= config.distDir %>/index.html', src: '<%= config.srcDir %>/index.html' },
        ]
      },
      styles: {
        files: [
          { dest: '<%= config.distDir %>/styles/', src: '**', expand: true, cwd: '<%= config.srcDir %>/styles/' },
        ]
      },
      scripts: {
        files: [
          { dest: '<%= config.distDir %>/app/', src: '**', expand: true, cwd: '<%= config.srcDir %>/app/' },
          { dest: '<%= config.distDir %>/vendor/', src: '**', expand: true, cwd: 'vendor/' },
        ]
      },
      assets: {
        files: [
          { dest: '<%= config.distDir %>/assets/', src: '**', expand: true, cwd: '<%= config.srcDir %>/assets/' },
        ]
      },
    },
    sshconfig: grunt.file.readJSON('.sshconfig'),
    sshexec: {
      'make-release-dir': {
        command: "mkdir -m 777 -p <%= sshconfig.path %>/releases/" + dirname,
        options: {
          host: '<%= sshconfig.host %>',
          username: '<%= sshconfig.username %>',
          password: '<%= sshconfig.password %>',
          port: '<%= sshconfig.port %>',
        }
      },
      'update-symlinks': {
        command: "rm -rf <%= sshconfig.path %>/current && cd <%= sshconfig.path %> && ln -s releases/" + dirname + " current",
        options: {
          host: '<%= sshconfig.host %>',
          username: '<%= sshconfig.username %>',
          password: '<%= sshconfig.password %>',
          port: '<%= sshconfig.port %>',
        }
      },
    },
    sftp: {
      deploy: {
        files: {
          './': '<%= config.distDir %>/**'
        },
        options: {
          host: '<%= sshconfig.host %>',
          username: '<%= sshconfig.username %>',
          password: '<%= sshconfig.password %>',
          port: '<%= sshconfig.port %>',
          path: '<%= sshconfig.path %>/current/',
          createDirectories: true,
          srcBasePath: "dist/",
          directoryPermissions: parseInt(755, 8)
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      html: {
        files: '<%= config.srcDir %>/index.html',
        tasks: ['copy:index']
      },
      js: {
        files: '<%= config.srcDir %>/app/*.js',
        tasks: ['copy:scripts']
      },
      css: {
        files: '<%= config.srcDir %>/styles/*.css',
        tasks: ['copy:styles']
      }
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: '<%= config.distDir %>'
        }
      }
    },
    webfont: {
      icons: {
        src: 'icons/*.svg',
        dest: 'src/styles/fonts',
        options: {
          font: 'skinnies',
          types: 'eot,svg,ttf,woff',
          embed: true
        }
      }
    },
    encodeImages: {
      build: {
        files: [{
          expand: false,
          src: '<%= config.distDir %>/styles/main.css',
          dest: '<%= config.distDir %>/styles/main.css'
        }]
      }
    }
  };

  grunt
    .initConfig(tasksConfig);

  grunt
    .registerTask('default', [''])
    .registerTask('build', ['clean:dist', 'copy:index', 'copy:styles', 'copy:assets', 'copy:scripts','encodeImages']) 
    .registerTask('deploy', ['build', 'sshexec:make-release-dir', 'sshexec:update-symlinks', 'sftp:deploy'])
    .registerTask('server', ['connect:server', 'watch'])
    .registerTask('font', ['webfont'])
};