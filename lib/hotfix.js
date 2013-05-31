'use strict';

module.exports = function(config){
  var change = require('./change')(config);
  var hotfix = module.exports = Object.create(change);
  hotfix.changeType = 'hotfix';
  hotfix.baseBranch = config['releaseBranch'];
  hotfix.changeLogOptions = { rotate: true };
  hotfix.releaseType = 'patch';

  var changelog = require('./changelog')(config);
  var shelljs = require('shelljs');
  var branch = require('./branch');

  hotfix.accept = function(pullNumber, options, callback){
    change.accept(pullNumber, { baseBranch: hotfix.baseBranch }, function(){

      // Immediatley rotate the changelog
      changelog.rotate({ releaseType: hotfix.releaseType }, function(err){
        if (err) { return callback(err); }

        // Bump version and tag release with npm version
        shelljs.exec('npm version '+hotfix.releaseType+' -m "Bump version to %s"');

        // Update local branches
        branch.update(config['developmentBranch']);
        branch.merge(config['releaseBranch']);

        // Push updates
        branch.push(config['releaseBranch']);
        branch.push(config['developmentBranch']);
        branch.pushTags(config);

        if (callback) { callback(); }
      });
    });
  };

  return hotfix;
};
