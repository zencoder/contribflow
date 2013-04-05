/*
 * contribflow
 * https://github.com/zencoder/contribflow
 *
 * Copyright (c) 2013 Steve Heffernan
 * Licensed under the Apache-2.0 license.
 */
'use strict';

module.exports = function(config){
  'use strict';
  var config = require('./config')(config);

  return {
    feature: require('./feature')(config),
    hotfix: require('./hotfix')(config)
  };
};
