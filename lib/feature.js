'use strict';

module.exports = function(config){
  var change = require('./change')(config);
  var feature = module.exports = Object.create(change);
  feature.changeType = 'feature';
  feature.baseBranch = config['developmentBranch'];

  return feature;
};
