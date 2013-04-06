'use strict';

var log = module.exports = function(str, options) {
  options = options || {};

  if (options.arrow !== false) {
    str = '-----> ' + str;
  }

  console.log(str);
};

log.warn = function(str, options){
  log('WARNING: ' + str, options);
};