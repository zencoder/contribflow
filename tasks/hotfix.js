(function(){
  'use strict';

  var hotfix = require('../lib/hotfix');

  module.exports = function(grunt) {
    grunt.registerTask('hotfix', 'hotfix management tasks', function(action, option, option2){
      var done = this.async();

      function taskCallback(err){
        if (err) {
          grunt.log.error(err);
          return done(false);
        }
        done(true);
      }

      // Start a new hotfix
      if (action === 'start') {
        hotfix.start(option, {}, taskCallback);

      // Delete a hotfix
      } else if (action === 'delete') {
        hotfix.del(option, {}, taskCallback);

      // Submit a hotfix via pull request
      } else if (action === 'submit') {
        hotfix.submit(option, {
          upstreamOwner: grunt.option('owner'), // CLI flag
          baseBranchName: grunt.option('branch') // CLI flag
        }, taskCallback);

      // Download the branch from a pull requst and run tests
      } else if (action === 'test') {
        hotfix.test(option, {}, taskCallback);

      } else if (action === 'accept') {
        hotfix.accept(option, {}, taskCallback);
      }
    });
  };
})();
