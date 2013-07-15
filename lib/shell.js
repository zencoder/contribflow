'use strict';

var shell = module.exports = {};
var shelljs = require('shelljs');
var log = require('./log.js');
// var exec = require('child_process').exec;

shell.failed = false;

shell.exec = function(command, options) {
  options = options || {};

  if (options.silent !== true) {
    log('$ ' + command, { arrow: false });
  }

  if (!shell.failed) {
    var result = shelljs.exec(command, options);

    if (result.code !== 0 && options.catchFail !== false) {
      shell.failed = true;
      log.error('Process aborted');
      log.error('Exit status: '+result.code);
      log.error('You may need to run any following commands manually...');
    }

    return result;
  }
  return { output: '', code: 0 };
};

// shell.run = function(command, options, callback) {
//   options = options || {};

//   if (typeof options === 'function') {
//     callback = options;
//     options = {};
//   }
//   callback = callback || function(){};

//   if (options.logging !== false) {
//     log('$ ' + command, { arrow: false });
//   }

//   exec(command, function(err, stdout, stderr){
//     if (err) { return callback(err); }

//     log(stdout, { arrow: false });
//     return callback(null, stdout);
//   });
// };
