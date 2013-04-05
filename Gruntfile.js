'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*_test.js'],
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadTasks('./tasks');

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

  grunt.registerTask('asdf', function(){
    // https://github.com/libgit2/node-gitteh/issues/31
    // var gitteh = require("gitteh");
    // var path = require("path");

    // gitteh.openRepository(path.join(__dirname, ".."), function(err, repo) {
    //   exports.repo = repo;

    //   repo.remote("test", function(err, remote) {
    //     exports.remote = remote;

    //     remote.connect("fetch", function(err) {
    //       if(err) return console.error(err);
    //       console.log(remote);
    //       console.log(remote.connected);
    //       console.log(remote.refs);
    //     });
    //   });
    // });

    // var done = this.async();

    // var shell = require('./lib/shell');
    // shell.run('git remote -v', {}, function(err, stdout){
    //   console.log(stdout.match(/origin\s+git@github\.com:([^\/]+)/)[1]);
    //   done();
    // });
  });

};
