// Change is the base 'class' of repo functions that are shared 
// between features and hotfixes. These functions should not be used
// directly. Only through feautre or hotfix, which inherit these functions.
'use strict';

module.exports = function(config){

  var change = {};

  var prompt = require('prompt');
  // Set up the Github connection for pull requests
  var GithubAPI = require('github');
  var github = new GithubAPI({
      // required
      version: '3.0.0',
      // optional
      timeout: 5000
  });

  var ask = require('./ask');
  var branch = require('./branch');
  var log = require('./log');
  var pr = require('./pullrequest');

  change.changeType = 'no-change-type'; // Should not get used
  change.baseBranch = 'no-base-branch';

  change.start = function(name, options, callback){
    options = options || {};
    var changeType = options.changeType || this.changeType;
    var baseBranch = options.baseBranch || this.baseBranch;

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
    var changeType = options.changeType || this.changeType;
    var baseBranch = options.baseBranch || this.baseBranch;

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
    var baseBranch = options.baseBranch || this.baseBranch;
    var upstreamOwner = options.upstreamOwner || config.upstream || 'zencoder';

    this.getBranchName(changeName, {}, function(err, branchName){
      if (err) { return callback(err); }
      pr.createFromBranch(branchName, options, callback);
    });
  };

  change.test = function(pullNumber, options, callback){
    pr.copyBranch(pullNumber, options, function(err, branchName){
      if (err) { return callback(err); }
      log(branchName + ' copied into your local repo');
      // grunt.task.run('test');
    });
  };

  change.accept = function(pullNumber, options, callback){
    var branchName;

    if (pullNumber) {
      confirmAccept(pullNumber, options, callback);
    } else {
      this.getPullRequest(null, options, function(err, pull){
        if (err) { return callback(err); }
        confirmAccept(pull.number, options, callback);
      });
    }

    function confirmAccept(pullNumber, options, callback) {
      ask.confirm('Are you sure you want to merge pull request '+pullNumber+'?', options, function(err, result){
        if (err) { return callback(err); }

        if (result === true) {
          pr.accept(pullNumber, options, callback);
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
      branchName = changeType + '/' + changeName;
      if (options.owner) {
        branchName = options.owner + '_' + branchName;
      }
      return branch.getPullRequest(branchName, {}, callback);
    }

    // Use current branch name
    this.getBranchName(null, {}, function(err, branchName){
      if (err) {
        return pr.askForNumber(callback);
      }
      branch.getPullRequest(branchName, {}, callback);
    });
  };

  change.getBranchName = function(changeName, options, callback){
    options = options || options
    var type = options.changeType || this.changeType;

    branch.current({ changeType: type }, function(err, info){
      if (err) { return callback(err); }

      if (info) {
        callback(null, info.name);
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
    });
  };

  return change;
};
