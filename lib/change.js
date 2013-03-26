(function(){
  'use strict';

  var change = module.exports = {};

  var prompt = require('prompt');
  var ask = require('./ask');
  var branch = require('./branch');
  var log = require('./log');
  var PR = require('./pullrequest');

  // Set up the Github connection for pull requests
  var GithubAPI = require('github');
  var github = new GithubAPI({
      // required
      version: '3.0.0',
      // optional
      timeout: 5000
  });

  change.start = function(name, options, callback){
    options = options || {};

    var changeType = options.changeType || 'feature';
    var baseBranch = options.baseBranch || 'master';

    if (!name) {
      prompt.start();
      prompt.get({
        name: 'name',
        message: 'Name of the ' + changeType,
        validator: /^[a-z0-9\-]+$/,
        warning: 'Names can only contain dashes, 0-9, and a-z',
        required: true
      }, function (err, result) {
        if (err) { return callback(err); }
        startGit(result.name, {}, callback);
      });
    } else {
      startGit(name, {}, callback);
    }

    function startGit(name, options, callback) {
      var branchName = changeType + '/' + name;

      branch.update(baseBranch, { upstream: true }, function(err){
        if (err) { return callback(err); }

        branch.create(branchName, { base: baseBranch }, function(err){
          if (err) { return callback(err); }

          branch.push(branchName, {}, function(err){
            if (err) { return callback(err); }

            branch.track(branchName, {}, function(err){
              if (!err) { log('Ready to start building your '+changeType+'. In branch '+branchName+'.'); }
              callback(err);
            });
          });
        });
      });
    }
  };

  change.del = function(name, options, callback){
    options = options || {};
    var baseBranch = options.baseBranch || 'master';
    var changeType = options.changeType || 'feature';

    change.getBranchName(name, {}, function(err, branchName){
      if (err) { return callback(err); }

      ask.confirm('Are you sure you want to delete ' + branchName + '?', options, function(err, result){
        if (err) { return callback(err); }

        if (result === true) {
          deleteGit(branchName, {}, callback);
        } else {
          callback('Delete branch aborted');
        }
      });
    });

    function deleteGit(branchName, options, callback) {
      branch.checkout(baseBranch, {}, function(err){
        if (err) { return callback(err); }

        branch.deleteLocal(branchName, {}, function(err){
          if (err) { return callback(err); }

          branch.deleteRemote(branchName, {}, function(err){
            if (!err) { log(changeType + ' deleted'); }
            callback(err);
          });
        });
      });
    }
  };

  change.submit = function(changeName, options, callback){
    options = options || {};
    options.upstreamOwner || 'zencoder';
    options.baseBranch || 'master';

    change.getBranchName(changeName, {}, function(err, branchName){
      if (err) { return callback(err); }
      PR.createFromBranch(branchName, options, callback);
    });
  };

  change.test = function(pullNumber, options, callback){
    PR.copyBranch(pullNumber, options, function(err, branchName){
      if (err) { return callback(err); }
      log(branchName + ' copied into your local repo');
      grunt.task.run('test');
    });
  };

  change.accept = function(pullNumber, options, callback){
    var branchName;

    if (pullNumber) {
      confirmAccept(pullNumber, options, callback);
    } else {
      change.getPullRequest(null, options, function(err, pull){
        if (err) { return callback(err); }
        confirmAccept(pull.number, options, callback);
      });
    }

    function confirmAccept(pullNumber, options, callback) {
      ask.confirm('Are you sure you want to merge pull request '+pullNumber+'?', options, function(err, result){
        if (err) { return callback(err); }

        if (result === true) {
          PR.accept(pullNumber, options, callback);
        } else {
          callback('Accept aborted');
        }
      });
    }
  };

  change.getPullRequest = function(changeName, options, callback){
    options = options || {};

    var branchName;
    var changeType = options.changeType || 'feature';

    if (changeName) {
      branchName = changeType+'/'+changeName;
      if (options.owner) {
        branchName = options.owner + '_' + branchName;
      }
      return branch.getPullRequest(branchName, {}, callback);
    }

    // Use current branch name
    change.getBranchName(null, {}, function(err, branchName){
      if (err) {
        return PR.askForNumber(callback);
      }
      branch.getPullRequest(branchName, {}, callback);
    });
  };

  change.getBranchName = function(changeName, options, callback){
    options = options || options
    var type = options.changeType || 'feature';

    function success(changeName){
      callback(null, type + '/' + changeName);
    }

    if (!changeName) {
      branch.current({ changeType: type }, function(err, info){
        if (err) { return callback(err); }
        success(info.changeName);
      });
    } else {
      success(changeName);
    }
  };
})();
