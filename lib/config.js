'use strict';

module.exports = function(configArg){
  var findup = require('findup-sync');
  var config = { // Default options
    "developmentBranch": "master",
    "releaseBranch": "stable",
    "remote": "origin",
    "upstream": "none"
  };
  var configFile = findup('contrib.json');

  if (configFile) {
    config = mergeOptions(config, require(configFile));
  }

  config = mergeOptions(config, configArg);

  return config;
}

function mergeOptions(config1, config2){
  var result

  config1 = config1 || {};
  config2 = config2 || {};

  // Copy first config
  for (prop in config1) {
    if (config1.hasOwnProperty(prop)) {
      result[prop] = config1[prop];
    }
  }

  // Override with second config
  for (prop in config2) {
    if (config2.hasOwnProperty(prop)) {
      result[prop] = config2[prop];
    }
  }
}