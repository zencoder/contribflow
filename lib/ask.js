var prompt = require('prompt');

var ask = module.exports = {};

ask.confirm = function(question, options, callback) {
  prompt.start();
  prompt.get({
    name: 'yesno',
    message: question,
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    'default': 'no'
  }, function (err, result) {
    if (err) { return callback(err); }

    if (result.yesno === 'yes' || result.yesno === 'y') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
};