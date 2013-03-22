(function(){
  'use strict';

  var feature = require('../lib/feature');

  module.exports = function(grunt) {
    grunt.registerTask('feature', 'feature management tasks', function(action, option, option2){
      var done = this.async();

      function taskCallback(err){
        if (err) {
          grunt.log.error(err);
          return done(false);
        }
        done(true);
      }

      // Start a new feature
      if (action === 'start') {
        feature.start(option, {}, taskCallback);

      // Delete a feature
      } else if (action === 'delete') {
        feature.del(option, {}, taskCallback);

      // Submit a feature via pull request
      } else if (action === 'submit') {
        feature.submit(option, {
          upstreamOwner: grunt.option('owner'), // CLI flag
          baseBranchName: grunt.option('branch') // CLI flag
        }, taskCallback);

      // Download the branch from a pull requst and run tests
      } else if (action === 'test') {
        feature.test(option, {}, taskCallback);

      } else if (action === 'accept') {
        feature.accept(option, {}, taskCallback);
      }
    });
  };
})();
