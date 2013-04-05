'use strict';

module.exports = function(config){
  var change = require('./change')(config);
  var hotfix = module.exports = Object.create(change);
  hotfix.changeType = 'hotfix';
  hotfix.baseBranch = config['releaseBranch'];

  return hotfix;
};