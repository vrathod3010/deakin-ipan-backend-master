const debug = require('debug')('app:redisHandler')
const redis = require('redis')
var redisClient
const SOCKETS_NAMESPACE = 'sockets:'

const TOKEN_MANAGER = require('../lib/tokenManager')

const initialiseClient = function (cb) {
  redisClient = redis.createClient(process.env.REDIS_PORT)

  redisClient.on('error', function (msg) {
    debug("Redis connection error:", msg)
    cb(msg)
  })

  redisClient.on('end', function (msg) {
    debug("Redis connection ended:", msg)
    cb(msg)
  })

  redisClient.on('connect', function () {
    debug("Redis connected")
  })

  redisClient.on('ready', function () {
    debug("Redis is ready")
    cb()
  })
}

const saveUserSocketID = function (requestData, cb) {
  // Check if token is valid
  // If it's not, cb err
  // Else save the socket ID for the given user in redis

  TOKEN_MANAGER.verifyToken(requestData.query.token, function (err, data) {
    if (err) return cb(err)

    redisClient.lpush(SOCKETS_NAMESPACE + data.userData._id.toString(), requestData.socketID)
    cb(null, data.userData._id)
  })
}

const getUserSocketIDs = function (userId, cb) {
  redisClient.lrange(SOCKETS_NAMESPACE + userId.toString(), 0, -1, (err, socketIDs) => {
    if (err) return cb(err)

    debug(socketIDs)
    cb(null, socketIDs)
  })
}

// We need to do this to delete dead socket connection IDs
const deleteUserSocketIDByAccessToken = function (requestData, cb) {
  // Check if token is valid
  // If it's not, cb err
  // Else remove the socket ID for the given user in redis

  TOKEN_MANAGER.verifyToken(requestData.query.token, function (err, data) {
    if (err) return cb(err)

    deleteUserSocketIDbyUserID(data.userData._id, requestData.socketID, cb)
  })
}

const deleteUserSocketIDbyUserID = function (userID, socketID, cb) {
  redisClient.lrem(SOCKETS_NAMESPACE + userID, 1, socketID, (err) => {
    if (err) return cb(err)

    cb(null, userID) // userID needs to stay here since this function may be called by deleteUserSocketIDByAccessToken
  })
}

module.exports = {
  initialiseClient: initialiseClient,
  saveUserSocketID: saveUserSocketID,
  getUserSocketIDs: getUserSocketIDs,
  deleteUserSocketIDbyUserID: deleteUserSocketIDbyUserID,
  deleteUserSocketIDByAccessToken: deleteUserSocketIDByAccessToken
}
