'use strict'
// Diagram: https://drive.google.com/file/d/1A9h0SoZqGplgJiB8CMR_WOyPLl4DCjHW/view?usp=sharing

const debug = require('debug')('app:nDispatcher')
const debugProcessedNotifications = require('debug')('app:nDispatcher:PROCESSED')
const debugRemovedNotification = require('debug')('app:nDispatcher:REMOVED')
const GenericDBService = require('../genricDBService')
const UserNotificationService = new GenericDBService("UserNotification")
const SOCKET_HANDLER = require('../socketHandler')
var HELPER = require('../utils/helper')

var NOTIFICATION_MEDIUMS = [
  { name: 'socket', method: SOCKET_HANDLER.notifyUser }
]
if(process.env.TWILIO_ENABLED === 'true') { 
  NOTIFICATION_MEDIUMS.push({ name: 'twilio', method: require('./twilioHandler').notifyUser })
}


var NOTIFICATIONS_LIST = [], FAILED = {}

const notificationsCB = (err) => {
  if (err) debug(err)
}

/**
 * Check for any existing notificaions for any users on the first run
 * If there are any, dispatch them
 * @param {*} cb Callback
 */
const checkPendingNotifications = function (cb) {
  debug('checkPendingNotifications called')
  const minDate = new Date()

  const criteria = {
    $and: [
      { readStatus: false },
      { deliverDateTime: { $lte: minDate } }
    ]
  }

  fetchAndDispatchUserNotifications(criteria, cb)
}

// b1. Fetch notifications using CRON job which needs to be sent within next 30s [PUBLIC method]
const CRONNotifications = function (cb) {

  /**
   * Get notifications for all users which needs to be sent within next 1 minute
   * Populate NOTIFICATIONS_LIST with the pending notifications for each user
   * dispatch
   */
  const minDate = new Date()
  const maxDate = new Date(minDate.getTime() + 30000)

  const criteria = {
    $or: [
      {
        $and: [
          { deliverDateTime: { $gte: minDate, $lte: maxDate } },
          { readStatus: false }
        ]
      },
      {
        $and: [
          { readStatus: false },
          { deliverDateTime: { $lte: minDate } }
        ]
      }
    ]
  }

  fetchAndDispatchUserNotifications(criteria, cb)
}

const fetchAndDispatchUserNotifications = function (criteria, cb) {
  const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0
  }

  UserNotificationService.getRecord(criteria, projection, {}, (err, data) => {
    debug("UserNotificationService.getRecord() calllback")


    if (err) return cb(err)
    if (data.length === 0) return cb()

    NOTIFICATIONS_LIST.push(...data)
    dispatch(data)
    cb()

  })
}

// c6, a8. Dispatch if notification needs to be sent immediately [PUBLIC method]
const addNotifications = function (notificationsArr, cb) {
  /**
   * Populate NOTIFICATIONS_LIST with the pending notifications for the given user
   * dispatch
   */

  NOTIFICATIONS_LIST.push(...notificationsArr)
  dispatch(notificationsArr)
  cb()

}

/**
 * Dispatch any immediate notifications to all available mediums
 * @param {*} immediateNotifications Array of userNotifications
 */
const dispatch = function (immediateNotifications) {
  const totalNotifications = immediateNotifications.length
  if (totalNotifications === 0) return

  var processedNotifications = 0

  immediateNotifications.forEach((notification) => {
    dispatchNotificationUsingMultipleMediums(notification, (err) => {
      if (!err) debugProcessedNotifications("totalNotifications=", totalNotifications + ", processedNotifications=", ++processedNotifications)
    })
  })
}

// b2. Dispatch notification to required user
const dispatchNotificationUsingMultipleMediums = function (notificationData, cb) {
  // TODO: FUTURE: Check user notification medium preferences, for example SMS, email, app-only

  HELPER.asyncForEach(NOTIFICATION_MEDIUMS, (medium) => {
    /**
     * Try notifying user
     * If it fails, add that notification for that user for that medium to the FAILED object and persist
     * Remove that notification from the NOTIFICATIONS_LIST object and persist
     */

    medium.method(notificationData.userId, notificationData, (err) => {
      debug(medium.name + '.notifyUser() callback called')

      if (err) recordFailedMedium(medium.name, err, notificationData, cb)

      removeNotification(notificationData)
      cb()
    })

  })
}

const recordFailedMedium = function (medium, error, notificationData, cb) {
  debug("recordFailedMedium() called")


  if (!FAILED[medium]) FAILED[medium] = []
  FAILED[medium].push({ error: error, notificationData: notificationData })


  debug("FAILED notifications count=", FAILED[medium].length, "for medium=", medium)

  cb(error)
  // TODO: Persist
}

const removeNotification = function (notificationData) {
  debugRemovedNotification("removeNotification() called for data=", notificationData)
  debugRemovedNotification("Before removing: NOTIFICATIONS_LIST=\n", NOTIFICATIONS_LIST)

  UserNotificationService.updateRecord({ _id: notificationData._id }, { readStatus: true }, {}, (err, data) => {
    if (err) return debug(err)

    NOTIFICATIONS_LIST.splice(NOTIFICATIONS_LIST.indexOf(notificationData), 1)
    debugRemovedNotification("After removing: NOTIFICATIONS_LIST=\n", NOTIFICATIONS_LIST)
  })
}

const appCRONNotifications = function (cb) {
  debug('appCRONNotifications() called')
  checkPendingNotifications(notificationsCB)

  CRONNotifications(notificationsCB)
  setInterval(CRONNotifications, 30000, notificationsCB)
  if (cb) cb()
}

module.exports = {
  appCRONNotifications: appCRONNotifications,
  CRONNotifications: CRONNotifications,
  addNotifications: addNotifications
}
