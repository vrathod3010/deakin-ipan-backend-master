'use strict';
// External dependencies
require('dotenv').config();
const debug = require('debug')('app:server')
var hapi = require('hapi');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require(`./config/environments/${process.env.NODE_ENV}`);

var db = require('./config/database')(process.env.NODE_ENV);
const DB_HELPER = require('./utils/dbHelper');

DB_HELPER.establishConnection(db, (err) => {
  if (err) return;
  if (process.env.NODE_ENV === "test") require('../seed.js')(() => {
    var nDispatcher = require('./lib/notificationsDispatcher')
    nDispatcher.appCRONNotifications()
    process.emit('SEED_READY')
  });
});

// Internal dependencies
var APP_CONSTANTS = require('./config/appConstants');
var PLUGINS = require('./plugins');
var ROUTES = require('./routes');

// Create server
var server = new hapi.Server({
  app: {
    name: process.env.APP_NAME
  }
});

server.connection({
  port: process.env.HAPI_PORT,
  routes: {
    cors: true
  }
});

// Register all plugins
server.register(PLUGINS, function (err) {
  if (err) {
    debug('Error while loading plugins: ' + err)
  } else {
    debug('Plugins Loaded')
  }
});

// Default routes
server.route(
  {
    method: 'GET',
    path: '/',
    handler: function (req, res) {
      res.view('welcome')
    }
  }
);

server.route(ROUTES);

// Add views
server.views({
  engines: {
    html: require('handlebars')
  },
  relativeTo: __dirname,
  path: './views'
});

var SOCKET_HANDLER = require('./socketHandler');
SOCKET_HANDLER.initialiseListener(server);

server.on('response', function (request) {
  debug('Request payload: ' + request.payload);
  debug(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});

// Start server
server.start(function () {
  debug('Server running at: ' + server.info.uri);
});

if (process.env.NODE_ENV === 'test') {

  server.resetDB = function (cb) {
    require('../seed.js')(() => {
      var nDispatcher = require('./lib/notificationsDispatcher')
      nDispatcher.appCRONNotifications()
      cb()
    })
  }

  server.isSeedReady = function (cb) {
    console.log("Waiting for seed..")
    process.on('SEED_READY', () => {
      console.log("Seed ready!")
      cb()
    })
  }
}

module.exports = server
