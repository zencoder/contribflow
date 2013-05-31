'use strict';

var colors = require('colors');

var log = module.exports = function(str, options) {
  options = options || {};

  if (options.arrow !== false) {
    str = ('-----> ' + str).yellow;
  }

  console.log(str);
};

log.warn = function(str, options){
  log(('WARNING: ' + str).yellow, options);
};

log.error = function(str, options){
  log(str.red, options)
}