'use strict';

module.exports = function(configArg){
  var findup = require('findup-sync');
  var shelljs = require('shelljs');
  var log = require('./log');

  // Default options
  var config = {
    "developmentBranch": "master",
    "releaseBranch": "stable",
    "owner": "NONE",
    "project": "NONE",
    "remote": "origin",
    "upstream": "upstream"
  };
  var configFile = findup('contrib.json');

  // Parse json file and merge with defaults
  if (configFile) {
    config = mergeOptions(config, require(configFile));
  }

  // Merge with any config options passed into the module
  config = mergeOptions(config, configArg);

  // Make sure 'upstream' exists for pulling from the main project
  var remotes = shelljs.exec('git remote -v', { silent: true }).output;
  if (/^upstream\s/mgi.test(remotes) === false) {
    // Check if we're the project owner as opposed to a contributor
    // by checking origin is the main project
    var originIsUpstream = new RegExp('^'+config.remote+'.*?'+config.owner+'\\/'+config.project, 'mi');
    var ownerCheck = remotes.match(originIsUpstream);
    if (ownerCheck) {
      log('As project owner');

      // Instead of pushing/pulling from upstream, use origin
      config.upstream = config.remote;
    } else {
      log.error('No upstream remote branch has been configured for this repo');
    }
  }

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