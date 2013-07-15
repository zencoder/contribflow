'use strict';

module.exports = function(){
  var changelog = {};
  var fs = require('fs');
  var prompt = require('prompt');
  var moment = require('moment');

  var shelljs = require('shelljs');
  var semver = require('semver');

  // Could be config options
  var fileName = 'CHANGELOG.md';
  var unreleasedTitle = '## Unreleased (HEAD)\n';
  var none = '_(none)_';
  var divider = '--------------------\n\n';

  changelog.init = function(options, callback){
    if (fs.existsSync(fileName)){
      var errMsg = fileName + ' already exists';
      if (callback) {
        return callback(errMsg);
      } else {
        console.log(errMsg);
      }
    }

    var contents = 'CHANGELOG\n=========\n\n';
    contents += unreleasedTitle + none + '\n\n' + divider;

    fs.writeFileSync(fileName, contents, 'utf8');

    // If a package.json exists, add a line for the current version
    if (fs.existsSync('package.json')){
      var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      changelog.update({ line: 'Added ' + fileName }, function(){
        changelog.rotate({ newVersion: pkg.version }, callback);
      });
    } else {
      if (callback) { callback(null); }
    }
  };

  changelog.update = function(options, callback){
    options = options || {};

    function doUpdate(line, callback){
      var data = fs.readFileSync(fileName, 'utf8');
      var newLine = '* ' + line;

      if (options.append) {
        newLine += ' ' + options.append;
      }

      // If 'none' is there, remove it
      data = data.replace(none + '\n', '');

      // Split on the divider including preceding newline
      var contents = data.split('\n'+divider);
      var top = contents[0] + newLine + '\n\n';

      // Combine new contents and write file
      data = top + divider + contents[1];
      fs.writeFileSync(fileName, data, 'utf8');

      // Commit changes
      shelljs.exec('git add . && git commit -a -m "Adding line to CHANGELOG"', callback);
    }

    if (options.line) {
      doUpdate(options.line);
    } else {
      prompt.start();
      prompt.get({
        name: 'line',
        message: 'Add one line to the changelog',
        required: true
      }, function (err, result) {
        if (err) { return callback(err); }
        doUpdate(result.line, callback);
      });
    }

  };

  changelog.rotate = function(options, callback){
    options = options || {};

    // Get next version number
    var newVersion;
    if (options.newVersion) {
      newVersion = options.newVersion;
    } else {
      // Assuming that the package version will be bumped after this
      // using something like `npm version`, that bumps and tags at once
      var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      newVersion = semver.inc(pkg.version, options.releaseType || 'patch');
    }

    // Get existing contents
    var contents = fs.readFileSync(fileName, 'utf8');
    
    // Get the new changes
    // Everything after the unrelease title
    var changes = contents.split(unreleasedTitle)[1];
    // Trim off everything after last change
    changes = changes.split('\n\n')[0];
    // Replace unreleased changes with 'none'
    contents = contents.replace(changes, none);

    // Build new version title
    var title = '##' + ' ' + newVersion + ' ('+ moment().format('YYYY-MM-DD') +')\n';
    contents = contents.replace(divider, divider + title + changes + '\n\n');

    fs.writeFileSync(fileName, contents, 'utf8');
    shelljs.exec('git add . && git commit -a -m "Rotating CHANGELOG"', callback);
  };

  return changelog;
};
