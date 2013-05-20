'use strict';

var branch = module.exports = {};
var shell = require('./shell.js');
var log = require('./log.js');
// Set up the Github connection for pull requests
var GithubAPI = require('github');
var github = new GithubAPI({
    // required
    version: '3.0.0',
    // optional
    timeout: 5000
});

var shelljs = require('shelljs');

branch.test = function(){
  console.log(shelljs.exec('node --version').output);
};

branch.parseName = function(name){
  var match, changeType, changeName, owner, ownerBranchName, tempName, other;

  tempName = name;

  match = tempName.match(/((.*)\/)?([^\/]+)$/);
  if (!match) return false;

  changeName = match[3];
  other = match[2];

  if (other) {
    if (/^(feature|hotfix|release)$/.test(other)) {
      changeType = other;
    } else {
      match = other.match(/^([^\/]+)(\/(.*))?/);
      owner = match[1];
      changeType = match[3];
      ownerBranchName = (changeType) ? changeType + '/' + changeName : changeName;
    }
  }

  return {
    name: name,
    changeType: changeType,
    changeName: changeName,
    owner: owner,
    ownerBranchName: ownerBranchName
  };
};

branch.current = function(options){
  var name, info;
  options = options || {};

  var stdout = shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).output;
  var info = branch.parseName(stdout.replace('\n', ''));

  if (options.changeType && options.changeType !== info.changeType) {
    return false;
  }

  return info;
};

branch.create = function(name, options){
  options = options || {};
  var base = options.base || 'master';
  var cmd = 'git checkout -b '+name+' '+base;

  if (options.url) {
    cmd += ' && git pull ' + options.url;
  }

  log('Creating the ' + name + ' branch based on ' + base);
  return shelljs.exec(cmd);
};

branch.update = function(name, options){
  options = options || {};
  var message = 'Updating the '+name+' branch';
  var cmd = 'git checkout '+name+' && git pull';

  if (options.upstream === true) {
    message += ' with upstream changes';
    cmd += ' upstream '+name;
  }

  log(message);
  return shelljs.exec(cmd);
};

branch.push = function(name, options){
  log('Pushing the '+name+' branch to origin');
  return shelljs.exec('git push origin ' + name);
};

branch.tag = function(name){
  return shelljs.exec('git tag -a "'+name+'" -m "'+name+'"');
};

branch.pushTags = function(options, callback){
  log('Pushing tags to ' + (options.remote || 'origin'));
  return shelljs.exec('git push ' + (options.remote || 'origin') + ' --tags');
};

branch.track = function(name, options){
  log('Tracking the '+name+' branch against origin/'+name);
  shelljs.exec('git branch --set-upstream '+name+' origin/'+name);
};

branch.checkout = function(name, options){
  log('Switching to the ' + name + ' branch');
  return shelljs.exec('git checkout ' + name);
};

branch.deleteLocal = function(name, options){
  log('Removing the local branch');
  return shelljs.exec('git branch -D ' + name);
};

branch.deleteRemote = function(name, options){
  log('Removing the remote branch from origin');
  return shelljs.exec('git push origin :'+name);
};

branch.merge = function(name, options){
  log('Merging in the '+name+' branch');
  shelljs.exec('git merge --no-ff ' + name);
};

branch.getPullRequest = function(branchName, options, callback){
  github.pullRequests.getAll({
    user: 'zencoder',
    repo: 'video-js',
    state: 'open'
  }, function(err, pulls){
    var pr;

    if (err) { return callback(err); }

    pulls.forEach(function(pull){
      if (branchName === pull.head.ref) {
        pr = pull;
      }
    });

    if (pr) {
      callback(null, pr);
    } else {
      callback('No pull request found or this branch');
    }
  });
};
