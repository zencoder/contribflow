(function(){
  'use strict';

  var change = require('./change');
  var config = require('./config');

  var feature = module.exports = Object.create(change);
  feature.changeType = 'feature';
  feature.baseBranch = config['developmentBranch'];

  // var Feature = module.exports = {};

  // var featureBaseBranch = 'master';

  // Feature.start = function(name, options, callback){
  //   options = options || {};
  //   options.changeType = 'feature';
  //   options.baseBranch = featureBaseBranch;

  //   change.start(name, options, callback)
  // };

  // Feature.del = function(featureName, options, callback){
  //   options = options || {};
  //   options.changeType = 'feature';
  //   options.baseBranch = featureBaseBranch;

  //   change.del(featureName, options, callback);
  // };

  // Feature.submit = function(featureName, options, callback){
  //   options = options || {};
  //   options.baseBranch = featureBaseBranch;

  //   change.submit(featureName, options, callback);
  // };

  // Feature.test = function(pullNumber, options, callback){
  //   options = options || {};
  //   options.baseBranch = featureBaseBranch;

  //   change.test(pullNumber, options, callback);
  // };

  // Feature.accept = function(pullNumber, options, callback){
  //   change.accept(pullNumber, options, callback);
  // };

  // Feature.getPullRequest = function(featureName, options, callback){
  //   options = options || {};
  //   options.changeType = 'feature';

  //   change.getPullRequest(featureName, options, callback);
  // };

  // Feature.getBranchName = function(featureName, options, callback){
  //   options = options || {};
  //   options.changeType = 'feature';

  //   change.getBranchName(featureName, options, callback);
  // };
})();
