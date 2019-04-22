const debug = require('debug')('app:swagger')
'use strict';

// Register swagger
var pack = require('../../package'),
  swaggerOptions = {
    apiVersion: pack.version,
    pathPrefixSize: 2,
    info: {
      'title': `${process.env.APP_NAME} API Documentation`,
      'description': `${process.env.APP_NAME} API documentation.`,
    }
  };

exports.register = function (server, options, next) {
  server.register({
    register: require('hapi-swagger'),
    options: swaggerOptions
  }, function (err) {
    if (err) debug('hapi-swagger load error: ' + err)
    else debug('hapi-swagger interface loaded')
  });

  next();
};

exports.register.attributes = {
  name: 'swagger-plugin'
};
