'use strict';

module.exports = function(config){
  var change = require('./change')(config);
  var hotfix = module.exports = Object.create(change);
  hotfix.changeType = 'hotfix';
  hotfix.baseBranch = config['releaseBranch'];
  hotfix.changeLogOptions = { rotate: true };
  hotfix.bumpsVersion = 'patch';

  var changelog = require('./changelog')(config);
  var shelljs = require('shelljs');
  var branch = require('./branch');

  hotfix.accept = function(pullNumber, options, callback){
    change.accept(pullNumber, options, function(){
      shelljs.exec('npm version '+this.bumpsVersion+' -m "Bump version to %s"');

      // Immediatley rotate the changelog
      changelog.rotate({}, function(err){
        if (err) { return callback(err); }
        var pkg = JSON.parse(require('./package.json'));
        branch.tag(pkg.version);
        branch.update(config['developmentBranch']);
        branch.merge(config['releaseBranch']);
        branch.push(config['releaseBranch']);
        branch.push(config['developmentBranch']);
        branch.pushTags(config);
        callback();
      });
    });
  };

  return hotfix;
};
