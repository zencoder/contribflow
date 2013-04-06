'use strict';

// Set up the Github connection for pull requests
var GithubAPI = require('github');
var github = new GithubAPI({
    // required
    version: '3.0.0',
    // optional
    timeout: 5000
});
var prompt = require('prompt');
var shell = require('./shell');
var branch = require('./branch');

var pr = module.exports = {};

pr.askForNumber = function(callback){
  prompt.start();
  prompt.get({
    name: 'pullId',
    message: 'Pull request number',
    validator: /^[0-9]+$/,
    warning: 'Number must be an integer',
    required: true
  }, function (err, result) {
    if (err) { return callback(err); }
    callback(null, result.pullId);
  });
};

pr.createFromBranch = function(branchName, options, callback) {
  options = options || {};
  var upstreamOwner = options.upstreamOwner || 'zencoder';
  var baseBranchName = options.baseBranch || 'master';

  // Ask for Github credentials
  var schema = {
    properties: {
      username: {
        description: 'Github Username',
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'Name must be only letters, spaces, or dashes',
        required: true
      },
      password: {
        description: 'Github Password',
        hidden: true,
        required: true
      },
      title: {
        description: 'Please title the pull request',
        required: true
      },
      body: {
        description: 'Please describe the feature',
        required: false
      }
    }
  };

  prompt.start();
  prompt.get(schema, function (err, result) {
    if (err) { return callback(err); }

    // Authentication is synchronus and only works for the next API call
    // This could be changed to store a token, which is how zenflow does it
    github.authenticate({
        type: 'basic',
        username: result.username,
        password: result.password
    });

    github.pullRequests.create({
      user: upstreamOwner,
      repo: 'video-js',
      title: result.title,
      body: result.body,
      head: result.username + ':' + branchName,
      base: baseBranchName
    }, function(err, result){
      if (!err) { log('Feature submitted!'); }
      callback(err);
    });
  });
};

pr.get = function(number, options, callback){
  options = options || {};
  options.user = options.user || 'zencoder';
  options.repo = options.repo || 'video-js';
  options.number = number

  github.pullRequests.get(options, callback);
};

pr.copyBranch = function(pullNumber, options, callback){
  options = options || {};
  var baseBranch = options.baseBranch || 'master';

  if (!pullNumber) {
    pr.askForNumber(function(err, num){
      if (err) { return callback(err); }
      pr.get(num, {}, handlePullRequest);
    });
  } else {
    pr.get(pullNumber, {}, handlePullRequest);
  }

  function handlePullRequest(err, pull){
    if (err) { return callback(err); }

    var branchName = pull.head.ref;
    var gitUrl = pull.head.repo.git_url;
    var owner = pull.head.repo.owner.login;
    var newBranchName = owner + '/' + branchName;

    branch.update(baseBranch, { upstream: true }, function(){
      branch.create(newBranchName, {
        base: baseBranch,
        url: gitUrl + ' ' + branchName
      }, function(err){
        callback(err, newBranchName);
      });
    });
  }
};

pr.accept = function(pullNum, options, callback){
  shell.run('pulley ' + pullNum, {}, callback);
};

