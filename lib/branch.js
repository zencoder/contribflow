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
    cmd += ' && git pull '+options.url;
  }

  log('Creating the ' + name + ' branch based on ' + base);
  return shell.exec(cmd);
};

branch.exists = function(name){
  var result = shell.exec('git show-ref --verify --quiet refs/heads/'+name, { silent: true, catchFail: false });

  // If code isn't 0 the branch doesn't exist
  return !result.code;
};

branch.update = function(name, options){
  options = options || {};
  var message = 'Updating the '+name+' branch';
  var cmd = 'git checkout '+name+' && git pull';

  if (options.remote) {
    message += ' with '+options.remote+' changes';
    cmd += ' '+options.remote+' '+name;
  }

  log(message);
  return shell.exec(cmd);
};

branch.push = function(name, options){
  options = options || {};
  var remote = options.remote || 'origin';

  log('Pushing the '+name+' branch to '+remote);
  return shell.exec('git push '+remote+' '+name);
};

branch.track = function(name, options){
  options = options || {};
  var remote = options.remote || 'origin';

  log('Tracking the '+name+' branch against '+remote+'/'+name);
  shell.exec('git branch --set-upstream '+name+' '+remote+'/'+name);
};

branch.checkout = function(name, options){
  log('Switching to the '+name+' branch');
  return shell.exec('git checkout '+name);
};

branch.deleteLocal = function(name, options){
  log('Removing the local branch');
  return shell.exec('git branch -D ' + name);
};

branch.deleteRemote = function(name, options){
  options = options || {};
  var remote = options.remote || 'origin';

  log('Removing the remote branch from '+remote);
  return shell.exec('git push '+remote+' :'+name);
};

branch.merge = function(name, options){
  log('Merging in the '+name+' branch');
  shell.exec('git merge --no-ff ' + name);
};

branch.tag = function(name){
  return shell.exec('git tag -a "'+name+'" -m "'+name+'"');
};

branch.pushTags = function(options, callback){
  options = options || {};
  var remote = options.remote || 'origin';

  log('Pushing tags to '+remote);
  return shell.exec('git push '+remote+' --tags');
};

branch.remoteURL = function(remote){
  remote = remote || 'origin';
  var remotes = shell.exec('git remote -v', { silent: true }).output;
  var remoteMatch = new RegExp('^'+remote+'\\s+([^\\s]+)/', 'mi');
  var result = remotes.match(remoteMatch);

  return (result) ? result[1] : false;
};

branch.fetchRemote = function(remoteName){
  log('Fetching '+remoteName);
  return shell.exec('git fetch '+remoteName);
};

// branch.getPullRequest = function(branchName, options, callback){
//   github.pullRequests.getAll({
//     user: 'zencoder',
//     repo: 'video-js',
//     state: 'open'
//   }, function(err, pulls){
//     var pr;

//     if (err) { return callback(err); }

//     pulls.forEach(function(pull){
//       if (branchName === pull.head.ref) {
//         pr = pull;
//       }
//     });

//     if (pr) {
//       callback(null, pr);
//     } else {
//       callback('No pull request found or this branch');
//     }
//   });
// };
