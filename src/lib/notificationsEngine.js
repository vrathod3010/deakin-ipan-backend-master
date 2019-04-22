'use strict'
// Diagram: https://drive.google.com/file/d/1A9h0SoZqGplgJiB8CMR_WOyPLl4DCjHW/view?usp=sharing

const debug = require('debug')('app:nEngine')

const GenericDBService = require('../genricDBService')
const UserService = new GenericDBService("User")
const UserNotificationService = new GenericDBService("UserNotification")
const NotificationDefinitionService = new GenericDBService("NotificationDefinition")
const NotificationsSynthesizer = require('./notificationsSynthesizer')
const NotificationsDispatcher = require ('./notificationsDispatcher')
const async = require('async')

const pf = function (fn) {
  debug(fn.name)
}

/** a3, c1. Trigger engine
 * At a time, engine can be triggered for only 1 type of event,
 * but an event can act as a trigger for multiple definitions.
 * 
 * @param {*} eventName The event name for which the engine will be triggered
 * @param {*} users Array of user objects that need to be notified. Can also be a simple string ALL
 * @param {*} additionalData Additional event related data, for example module name, etc. This data **SHOULD NOT BE MODIFIED IN THIS FILE. ALL OF THE REQUIRED DATA NEEDS TO COME FROM THE CALLER** 
 * @param {*} callback Self-explanatory
 */
const triggerEngine = function (eventName, users, additionalData, callback) {
  pf(triggerEngine)
  var notificationDefinitionsData, userFetchData, userNotifications
  async.series([
    function (cb) {
      fetchNotificationDefinitions(eventName, (err, data) => {
        if (err) return cb(err)

        notificationDefinitionsData = data
        cb()
      })
    },

    function (cb) {
      fetchUserProfile(users, (err, data) => {
        if (err) return cb(err)

        userFetchData = data
        cb()
      })
    },

    function (cb) {
      processEvent(notificationDefinitionsData, userFetchData, additionalData, (err, data) => {
        if (err) return cb(err)

        userNotifications = data
        cb()
      })
    },

    // c5, a7. Store
    function (cb) {
      debug('saveNotifications()')

      UserNotificationService.insertManyAsync(userNotifications, function (err, data) {
        if (err) return cb(err)

        var minDate = new Date()
        minDate.setSeconds(minDate.getSeconds() - 10) // Standard deviation
        minDate = minDate.getTime()

        var maxDate = new Date()
        maxDate.setSeconds(maxDate.getSeconds() + 30)
        maxDate = maxDate.getTime()

        var immediateNotifications = []

        data.forEach((item) => {

          const curr = new Date(item.deliverDateTime).getTime()
          
          debug('min=', minDate)
          debug('cur=', curr)
          debug('max=', maxDate)
          debug('curr >= minDate && curr <= maxDate', curr >= minDate && curr <= maxDate, '\n')
          
          if (curr >= minDate && curr <= maxDate)
            immediateNotifications.push(item)
        })

        debug('immediateNotifications.length=', immediateNotifications.length)

        NotificationsDispatcher.addNotifications(immediateNotifications, () => {
          cb(null, "NOTIFICATIONS ADDED")
        })

      })
    }
  ],
    function (err) {
      if (err) callback(err)

      callback()
    }
  )

}

// c2, a4. Fetch notification info based on the event
const fetchNotificationDefinitions = function (eventName, cb) {
  pf(fetchNotificationDefinitions)
  const criteria = { trigger: eventName }
  NotificationDefinitionService.getRecord(criteria, {}, {}, (err, data) => {
    if (err) return cb(err)
    if (0 === data.length) return cb("NO NOTIFICATION DEFINITIONS")

    cb(null, data)
  })
}

// c3, a5. Fetch user activity data
const fetchUserProfile = function (users, cb) {
  pf(fetchUserProfile)
  var criteria
  if (users === 'ALL') criteria = {}
  else {
    var userIDs = users.map(user => user.id)
    criteria = { id: { $in: userIDs } }
  }

  UserService.getRecord(criteria, {}, {}, function (err, data) {
    if (err) return cb(err)
    if (0 === data.length) return cb("NO USERS FOUND")

    cb(null, data)
  })
}

/**
 * c4, a6. Process the event received against
 * pre-defined notification truth table and
 * generate notification text and notification
 * attributes like time, frequency, etc.
 */
const processEvent = function (notificationDefinitionsData, usersFetchData, additionalData, cb) {
  pf(processEvent)

  var allUsersNotifications = []

  var processedCount = 0

  notificationDefinitionsData.forEach((notDef) => {

    var notificationObj = {}
    if (notDef.appLink) notificationObj.appLink = notDef.appLink

    if (notDef.deliveryTime.type === "INSTANT") {
      const date = new Date()
      // Add 30s standard deviation
      notificationObj.deliverDateTime = (new Date(date.getTime() + 30000)).toISOString()
    }

    usersFetchData.forEach((user) => {
      var userNotification = Object.assign({}, notificationObj)
      NotificationsSynthesizer.replacePlaceholders(notDef.message, user, additionalData, (err, generatedText) => {
        processedCount++

        if (err) return cb(err)

        userNotification.text = generatedText
        userNotification.userId = user._id

        allUsersNotifications.push(userNotification)

        if (processedCount === usersFetchData.length * notificationDefinitionsData.length) return cb(null, allUsersNotifications)
      })
    })
  })
}

module.exports = {
  triggerEngine: triggerEngine
}
