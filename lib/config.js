'use strict';

module.exports = function(configArg){
  var findup = require('findup-sync');
  var config = { // Default options
    "developmentBranch": "master",
    "releaseBranch": "stable",
    "remote": "origin",
    "upstream": false
  };
  var configFile = findup('contrib.json');

  if (configFile) {
    config = mergeOptions(config, require(configFile));
  }

  config = mergeOptions(config, configArg);

  return config;
}

function mergeOptions(config1, config2){
  var result, prop1, prop2;

  result = {};
  config1 = config1 || {};
  config2 = config2 || {};

  // Copy first config
  for (prop1 in config1) {
    if (config1.hasOwnProperty(prop1)) {
      result[prop1] = config1[prop1];
    }
  }

  // Override with second config
  for (prop2 in config2) {
    if (config2.hasOwnProperty(prop2)) {
      result[prop2] = config2[prop2];
    }
  }

  return result;
}