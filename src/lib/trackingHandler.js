'use strict'

const debug = require('debug')('app:trackingHandler')
var async = require('async')

const GenericDBService = require('../genricDBService')
const UserTrackingService = new GenericDBService("UserTracking")

const persistTrackingData = function (trackingData, callback) {
  var newRecordFlag = false
  var fetchData
  async.series([
    function (cb) {
      if (!trackingData.trackerId) {
        // User opens a new browser tab
        newRecordFlag = true
        debug("User opens a new browser tab")
        // ..hence return from this function block and generate new trackerId
        return cb()

      }

      // Not a new tracking session, decrypt trackerId
      trackingData.trackerId = decryptObjectId(trackingData.trackerId)
      debug("Not a new tracking session, decrypt trackerId")
      /** Check if the trackerId is valid. trackerId can be invalid if:
       * 1. There is no record found for the given trackerId
       * 2. If there is a userId in trackingData and it's the same as that in the DB
       */
      isTrackerIDValid(trackingData, (err, valid) => {
        if (err) return cb(err)
        if (!valid) newRecordFlag = true

        cb()

      })
    },

    function (cb) {
      trackingData._id = decryptObjectId(trackingData.trackerId)
      delete trackingData.trackerId

      if (newRecordFlag) {
        delete trackingData._id

        UserTrackingService.createRecord({ data: trackingData.data }, (err, data) => {
          if (err) return cb(err)

          debug('\ncreateRecord data:')
          debug(data)
          fetchData = data
          cb()

        })

      } else {
        const criteria = { _id: trackingData._id }
        delete trackingData._id
        var objects = [...trackingData.data]

        UserTrackingService.updateRecord(criteria, { $push: { data: { $each: objects } } }, {}, (err, data) => {
          if (err) return cb(err)

          debug('\nupdateRecord data:')
          debug(data)
          fetchData = data
          cb()

        })

      }
    }
  ],

    function (err) {
      if (err) return callback(err)
      // Always send trackerId back
      debug('\nFinal data:')
      debug(fetchData)
      callback(null, { trackerId: encryptObjectId(fetchData._id) })
    }
  )
}

const isTrackerIDValid = function (trackingData, cb) {
  const criteria = { _id: trackingData.trackerId }
  UserTrackingService.getRecord(criteria, {}, {}, (err, data) => {
    if (err) return cb(err)
    if (data.length === 0) return cb(null, false)
    // Check if there is a userId and it's the same as that in the DB
    if (trackingData.userId && data.userId && !trackingData.userId === data.userId) return cb(null, false)

    cb(null, true)

  })
}

const encryptObjectId = function (id) {
  // TODO: Implement this, use md5
  return id
}

const decryptObjectId = function (id) {
  // TODO: Implement this, use md5
  return id
}

const getTrackingData = function (cb) {
  UserTrackingService.getRecord({}, {}, {}, (err, data) => {
    if (err) return cb(err)
    if (data.length === 0) return cb('NO TRACKING DATA')

    cb(null, data)
  })
}

module.exports = {
  persistTrackingData: persistTrackingData,
  getTrackingData: getTrackingData
}
