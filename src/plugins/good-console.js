'use strict';

var good = require('good');

// Register Hapi good console

exports.register = function (server, options, next) {
  server.register({
    register: good,
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  }, function (err) {
    if (err) {
      throw err;
    }
  });

  next();
};

exports.register.attributes = {
  name: 'good-console-plugin'
};
