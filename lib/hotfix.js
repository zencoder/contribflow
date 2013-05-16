'use strict';

module.exports = function(config){
  var change = require('./change')(config);
  var hotfix = module.exports = Object.create(change);
  hotfix.changeType = 'hotfix';
  hotfix.baseBranch = config['releaseBranch'];
  hotfix.changeLogOptions = { rotate: true };
  hotfix.bumpsVersion = 'patch';

  var changelog = require('./changelog')(config);
  var shell = require('./shell');
  var branch = require('./branch');

  hotfix.accept = function(pullNumber, options, callback){
    change.accept(pullNumber, options, function(){
      shell.run('npm version '+this.bumpsVersion+' -m "Bump version to %s"' , function(err){
        if (err) { return callback(err); }

        // Immediatley rotate the changelog
        changelog.rotate({}, function(err){
          if (err) { return callback(err); }

          var pkg = JSON.parse(require('./package.json'));
          shell.run('git tag -a "'+pkg.version+'" -m "'+pkg.version+'"', function(){
            if (err) { return callback(err); }

            branch.update(config['developmentBranch'], {}, function(err){
              if (err) { return callback(err); }

              branch.merge(config['releaseBranch'], {}, function(err){
                if (err) { return callback(err); }

                branch.push(config['releaseBranch'], {}, function(err){
                  if (err) { return callback(err); }

                  branch.push(config['developmentBranch'], {}, function(err){
                    if (err) { return callback(err); }

                    branch.pushTags(config, callback);
                  });
                });
              });
            });
          });
        });
      });
    });
  };

  return hotfix;
};
