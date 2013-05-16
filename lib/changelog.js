'use strict';

module.exports = function(config){
  var changelog = {};
  var fs = require('fs');
  var prompt = require('prompt');
  var moment = require('moment');

  var shell = require('./shell');

  changelog.update = function(options, callback){
    options = options || {};

    prompt.start();
    prompt.get({
      name: 'line',
      message: 'Add one line to the changelog',
      required: true
    }, function (err, result) {
      if (err) { return callback(err); }

      var data = fs.readFileSync('CHANGELOG2.md', 'utf8');
      var newLine = '* ' + result.line + '\n';
      if (options.pullRequest) {
        newLine += ' ([PR: '+options.pullRequest+']('+options.pullRequestURL+'))';
      }
      fs.writeFileSync('CHANGELOG2.md', newLine + data, 'utf8');
      shell.run('git add . && git commit -a -m "Adding line to CHANGELOG"', callback);
    });
  };

  changelog.rotate = function(options, callback){
    options = options || {};

    var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    var data = fs.readFileSync('CHANGELOG2.md', 'utf8');
    var changes = data.split('\n\n```')[0];
    var newchanges = '\n```\n^ NEW CHANGES ABOVE ^\n```\n\n';
    var pageTitle = 'CHANGELOG\n=========\n\n';
    var clog = data.split('```')[2].replace(pageTitle, '');
    var h = '####';
    if (options.versionLevel === 'major') {
      h = '##';
    } else if (options.versionLevel === 'minor') {
      h = '###';
    }
    var title = h + ' ' + pkg.version + ' ('+ moment().format('YYYY-MM-DD') +')\n';
    var newContent = newchanges + pageTitle + title + changes + clog;

    fs.writeFileSync('CHANGELOG2.md', newContent, 'utf8');
    shell.run('git add . && git commit -a -m "Rotating CHANGELOG"', callback);
  };

  return changelog;
};