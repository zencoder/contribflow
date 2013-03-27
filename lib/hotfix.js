(function(){
  'use strict';

  var change = require('./change');
  var config = require('./config');

  var hotfix = module.exports = Object.create(change);
  hotfix.changeType = 'hotfix';
  hotfix.baseBranch = config['releaseBranch'];

})();