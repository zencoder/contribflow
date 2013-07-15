// Change is the base 'class' of repo functions that are shared
// between features and hotfixes. These functions should not be used
// directly. Only through feautre or hotfix, which inherit these functions.
'use strict';

module.exports = function(config){
  var change = {};

  var prompt = require('prompt');

  var ask = require('./ask');
  var branch = require('./branch');
  var log = require('./log');
  var pr = require('./pullrequest')(config);
  var changelog = require('./changelog')(config);

  change.changeType = 'no-change-type'; // Should not get used
  change.baseBranch = 'no-base-branch';

  // Create a new branch for a new feature/hotfix/release
  change.start = function(name, options, callback){
    options = options || {};
    callback = callback || function(){};

    var changeType = this.changeType;
    var baseBranch = options.baseBranch || this.baseBranch;
    function askForChangeName(callback) {
      prompt.start();
      prompt.get({
        name: 'name',
        message: 'Name of the ' + changeType,
        validator: /^[a-z0-9\-]+$/,
        warning: 'Names can only contain dashes, 0-9, and a-z',
        required: true
      }, function (err, result) {
        if (err) { return callback(err); }
        callback(null, result.name);
      });
    }

    function startGit(name, options, callback) {
      var branchName = changeType + '/' + name;

      // Create base branch if needed
      if (!branch.exists(baseBranch)) {
        // Need to git fetch upstream, so we can base with upstream branch
        branch.fetchRemote(config.upstream);
        branch.create(baseBranch, { base: 'remotes/'+config.upstream+'/'+baseBranch });
        branch.push(baseBranch);
        branch.track(baseBranch);
      }

      branch.update(baseBranch, { remote: config.upstream });
      branch.create(branchName, { base: baseBranch });
      branch.push(branchName);
      branch.track(branchName);
      log('Ready to start building your '+changeType+' in branch '+branchName+'.');
      callback();
    }

    if (name) {
      startGit(name, {}, callback);
    } else {
      askForChangeName(function(err, name){
        if (err) { return callback(err); }
        startGit(name, {}, callback);  
      });
    }

  };

  // Delete a change's local and remote branches
  change.del = function(name, options, callback){
    options = options || {};
    var changeType = options.changeType || this.changeType;
    var baseBranch = options.baseBranch || this.baseBranch;

    callback = callback || function(err){
      if (err) { return log.error(err); }
      log(changeType + ' deleted');
    };

    this.getBranchName(name, {}, function(err, branchName){
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
      branch.checkout(baseBranch);
      branch.deleteLocal(branchName);
      branch.deleteRemote(branchName);
      if (callback) { callback(); }
    }
  };

  // Submit a pull request for a change
  change.submit = function(changeName, options, callback){
    options = options || {};
    options.baseBranch = options.baseBranch || this.baseBranch;

    callback = callback || function(err, result){
      if (err) {
        if (err.code === 404) {
          log.error('The remote repo could not be found to submit the Pull Request.', options.arrow);
          log.error('Please try to submit the Pull Request manually in Github.', options.arrow);
        }
        if (err.code === 503) {
          log.error('The remote repo is not available to submit the Pull Request.', options.arrow);
          log.error('Please wait and try later to submit the Pull Request manually in Github.', options.arrow);
        }
        if (err.code === 504) {
          log.error('The Pull Request timed out trying to reach the remote repo.', options.arrow);
          log.error('Please wait and try later to submit the Pull Request manually in Github.', options.arrow);
        }
        return log.error(err.message);
      }
      if (result) {
        log('Pull request submitted!');
      }
    };

    this.getBranchName(changeName, {}, function(err, branchName){
      if (err) { return callback(err); }
      pr.createFromBranch(branchName, options, callback);
    });
  };

  // Copy a change branch locally and test it
  change.test = function(pullNumber, options, callback){
    pr.copyBranch(pullNumber, options, function(err, branchName){
      if (err) { return callback(err); }
      log(branchName + ' copied into your local repo');
      // grunt.task.run('test');
    });
  };

  // Copy a change branch locally
  change.copy = function(pullNumber, options, callback){
    pr.copyBranch(pullNumber, options, function(err, branchName){
      if (err) { 
        if (callback) { return callback(err); }
        log('Copy failed', err);
      }
      log(branchName + ' copied into your local repo');
    });
  };

  // Accept the pull request for a change
  change.accept = function(pullNumber, options, callback){
    options = options || {};

    var baseBranch = options.baseBranch || this.baseBranch;

    callback = callback || function(err){
      if (err) { return log.error(err); }
      log('Pull request accepted');
    };

    function confirmAccept(pullNumber, options, callback) {
      ask.confirm('Are you sure you want to merge pull request '+pullNumber+'?', options, function(err, result){
        if (err) { return callback(err); }

        if (result === true) {
          log('Merging pull request');
          pr.accept(pullNumber, options, function(err){
            if (err) { return callback(err); }

            var url = 'https://github.com/'+config.owner+'/'+config.project+'/pull/'+pullNumber;
            branch.update(baseBranch);
            log('Updating changelog');
            changelog.update({ append: '([view]('+url+'))' }, function(err, result){
              if (err) { return callback(err, result); }

              branch.push(baseBranch);
              callback(err, result);
            });
          });
        } else {
          callback('Accept aborted');
        }
      });
    }

    if (pullNumber) {
      confirmAccept(pullNumber, options, callback);
    } else {
      pr.askForNumber(function(err, pullNumber){
        if (err) { return callback(err); }
        confirmAccept(pullNumber, options, callback);
      });
    }

  };

  // change.getPullRequest = function(changeName, options, callback){
  //   options = options || {};

  //   var branchName;
  //   var changeType = options.changeType || 'feature';

  //   if (changeName) {
  //     branchName = changeType + '/' + changeName;
  //     if (options.owner) {
  //       branchName = options.owner + '_' + branchName;
  //     }
  //     return branch.getPullRequest(branchName, {}, callback);
  //   }

  //   // Use current branch name
  //   this.getBranchName(null, {}, function(err, branchName){
  //     if (err) {
  //       return pr.askForNumber(callback);
  //     }
  //     branch.getPullRequest(branchName, {}, callback);
  //   });
  // };

  change.getBranchName = function(changeName, options, callback){
    options = options || options;
    var type = options.changeType || this.changeType;
    var current = branch.current({ changeType: type });

    if (current) {
      callback(null, current.name);
    } else {
      prompt.start();
      prompt.get({
        name: 'name',
        message: 'Name of the ' + type + 'branch',
        validator: /^[A-Za-z0-9\-_\/]+$/,
        warning: 'Must be a valid branch name',
        required: true
      }, function (err, result) {
        if (err) { return callback(err); }
        callback(null, result);
      });
    }
  };

  return change;
};
