'use strict';

var shell = module.exports = {};
var log = require('./log.js');
var exec = require('child_process').exec;

shell.run = function(command, options, callback) {
  options = options || {};

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  callback = callback || function(){};

  if (options.logging !== false) {
    log('$ ' + command, { arrow: false });
  }

  exec(command, function(err, stdout, stderr){
    if (err) { return callback(err); }

    log(stdout, { arrow: false });
    return callback(null, stdout);
  });
};