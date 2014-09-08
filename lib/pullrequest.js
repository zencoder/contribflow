'use strict';

module.exports = function(config){
  var pr = {};

  // Set up the Github connection for pull requests
  var GithubAPI = require('github');
  var github = new GithubAPI({
      // required
      version: '3.0.0',
      // optional
      timeout: 5000
  });
  var prompt = require('prompt');
  var shelljs = require('shelljs');
  var branch = require('./branch');

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
    var owner = options.owner || config.owner;
    var baseBranch = options.baseBranch || config.developmentBranch;
    var project = options.project || config.project;

    // Make sure branch is checkedout and up to date
    branch.update(branchName);

    // Manage the current status of the branch
    var status = shelljs.exec('git status', { silent: true }).output;
    if (/Changes to be committed/i.test(status)) {
      return callback('Outstanding changes. Please commit changed files before creating the pull request.');
    } else if (/Changes not staged for commit/i.test(status)) {
      return callback('Outstanding changes. Please add files that you wish to commit.');
    } else if (/Your branch is ahead/i.test(status)) {
      branch.push(branchName);
    }

    // Get the remote repo github owner/organization for the branch
    var remoteURL = branch.remoteURL(options.remote || config.remote);

    if (!remoteURL) return callback('No remote URL was found for the branch');
    var orgMatch = remoteURL.match(/^.*?com[:|\/]([^\/]+)/);
    if (!orgMatch) return callback('Could not get branch org from remote URL');
    var org = orgMatch[1];

    // Ask for Github credentials
    var schema = {
      properties: {
        username: {
          description: 'Github Username',
          pattern: /^[a-zA-Z0-9][a-zA-Z0-9\-]*$/,
          message: 'Username may only contain alphanumeric characters or dashes and cannot begin with a dash',
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
        user: owner,
        repo: project,
        title: result.title,
        body: result.body,
        head: org + ':' + branchName,
        base: baseBranch
      }, callback);
    });
  };

  pr.get = function(number, options, callback){
    options = options || {};
    options.user = options.user || config.owner;
    options.repo = options.repo || config.project;
    options.number = number

    github.pullRequests.get(options, callback);
  };

  pr.copyBranch = function(pullNumber, options, callback){
    options = options || {};
    var baseBranch = options.baseBranch || config.developmentBranch;

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

      branch.update(baseBranch, { remote: config.upstream });
      branch.create(newBranchName, {
        base: baseBranch,
        url: gitUrl + ' ' + branchName
      });

      callback(null, newBranchName);
    }
  };

  pr.accept = function(pullNum, options, callback){
    shelljs.exec('pulley ' + pullNum, { async: true }, function (result){
      if (result.code !== 0) {
        callback(result.output);  
      } else {
        callback();
      }
    });
  };

  return pr;
};
