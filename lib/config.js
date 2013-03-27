var findup = require('findup-sync');

// Default Settings
var config = module.exports = {
  "developmentBranch": "master",
  "releaseBranch": "stable",
  "remote": "origin",
  "upstream": "upstream"
};

// Look for contrib.json settings file
var configFile = findup('contrib.json');
if (configFile) {
  var configData = require(configFile);

  // Override defaults with config settings
  for (prop in configData) {
    if (configData.hasOwnProperty(prop)) {
      config[prop] = configData[prop];
    }
  }
}
