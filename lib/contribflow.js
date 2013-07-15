/*
 * contribflow
 * https://github.com/zencoder/contribflow
 *
 * Copyright (c) 2013 Steve Heffernan
 * Licensed under the Apache-2.0 license.
 */
'use strict';

module.exports = function(config){
  config = require('./config')(config);

  return {
    feature: require('./feature')(config),
    hotfix: require('./hotfix')(config),
    branch: require('./branch'),
    changelog: require('./changelog')(config)
  };
};
