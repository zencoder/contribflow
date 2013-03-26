(function(){
  'use strict';

  var Feature = module.exports = {};

  var change = require('./change');

  var featureBaseBranch = 'master';

  Feature.start = function(name, options, callback){
    options = options || {};
    options.changeType = 'feature';
    options.baseBranch = featureBaseBranch;

    change.start(name, options, callback)
  };

  Feature.del = function(featureName, options, callback){
    options = options || {};
    options.changeType = 'feature';
    options.baseBranch = featureBaseBranch;

    change.del(featureName, options, callback);
  };

  Feature.submit = function(featureName, options, callback){
    options = options || {};
    options.baseBranch = featureBaseBranch;

    change.submit(featureName, options, callback);
  };

  Feature.test = function(pullNumber, options, callback){
    options = options || {};
    options.baseBranch = featureBaseBranch;

    change.test(pullNumber, options, callback);
  };

  Feature.accept = function(pullNumber, options, callback){
    change.accept(pullNumber, options, callback);
  };

  Feature.getPullRequest = function(featureName, options, callback){
    options = options || {};
    options.changeType = 'feature';

    change.getPullRequest(featureName, options, callback);
  };

  Feature.getBranchName = function(featureName, options, callback){
    options = options || {};
    options.changeType = 'feature';

    change.getBranchName(featureName, options, callback);
  };
})();
