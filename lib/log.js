'use strict';

module.exports = function(str, options) {
  options = options || {};

  if (options.arrow !== false) {
    str = '-----> ' + str;
  }

  console.log(str + '\n');
};
