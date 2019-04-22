const debug = require('debug')('app:socketHandler')

var io
var REDIS_HANDLER

var REDIS_STATUS_MSGS = {
  CONNECTED: 'CONNECTED',
  PAUSED: 'PAUSED',
  DISCONNECTED: 'DISCONNECTED'
}
var CONNECTION_STATUS = REDIS_STATUS_MSGS.DISCONNECTED

function initialiseListener(mainServer) {
  REDIS_HANDLER = require('./utils/redisHandler')
  REDIS_HANDLER.initialiseClient(function (err) {
    if (err) process.exit(1)

    io = require('socket.io').listen(mainServer.listener)
    debug("Socket listener started")

    io.on('connection', function (socket) {
      REDIS_HANDLER.saveUserSocketID({ query: socket.handshake.query, socketID: socket.id }, (err, userID) => {
        if (err) return socket.disconnect(true)

        debug("Socket connection established: " + userID)
      })

      socket.on('disconnect', (reason) => {
        REDIS_HANDLER.deleteUserSocketIDByAccessToken({ query: socket.handshake.query, socketID: socket.id }, (err, userID) => {
          if (err) debug(err)

          debug("Socket disconnected: " + userID + " Reason: " + reason)
        })
      })
    })
  })
}

function pauseListener() {

  // TODO: Add logic

  CONNECTION_STATUS = REDIS_STATUS_MSGS.PAUSED
}

function reconnectListener() {

  // TODO: Add logic

  CONNECTION_STATUS = REDIS_STATUS_MSGS.CONNECTED
}

function resumeListener() {
  if (CONNECTION_STATUS.CONNECTED) return
  if (CONNECTION_STATUS.DISCONNECTED) return reconnectListener()

  // TODO: Add logic

  CONNECTION_STATUS = REDIS_STATUS_MSGS.CONNECTED
}

function destroyListener() {

  // TODO: Add logic

  CONNECTION_STATUS = REDIS_STATUS_MSGS.DISCONNECTED
}

function notifyUser(userID, notificationData, cb) {
  REDIS_HANDLER.getUserSocketIDs(userID, (err, socketIDs) => {
    if (err) return cb(err)
    if (socketIDs.length === 0) return cb('No active user connections')

    socketIDs.forEach((socketID) => {
      if (!io.sockets.connected[socketID])
        return REDIS_HANDLER.deleteUserSocketIDbyUserID(userID, socketID , (err, userID) => {
          if (err) debug(userID, err)
        })

      io.sockets.connected[socketID].emit('notification', notificationData, (clientError) => {
        if (clientError) debug('clientError on socket ID: ' + socketID)

      })
    })

    cb()
  })
}

module.exports = {
  initialiseListener: initialiseListener,
  pauseListener: pauseListener,
  resumeListener: resumeListener,
  destroyListener: destroyListener,
  notifyUser: notifyUser
}
