'use strict';

var TokenManager = require('../lib/tokenManager');

exports.register = function (server, options, next) {

  // Register authorization plugin
  server.register(require('hapi-auth-bearer-token'), function (err) {
    if (err) throw err;
    server.auth.strategy('UserAuth', 'bearer-access-token', {

      allowQueryToken: false,
      allowMultipleHeaders: true,
      accessTokenName: 'accessToken',

      validateFunc: (token, callback) => {

        TokenManager.verifyToken(token, (err, response) => {
          if (err || !response || !response.userData) {
            callback(null, false, { token: token, userData: null });
          } else {
            callback(null, true, { token: token, userData: response.userData });
          }
        });
      }
    });
  });

  next();
};

exports.register.attributes = {
  name: 'auth-token-plugin'
};
