'use strict'

const services = require('../../services')
const UserNotificationService = services.UserNotificationService
const HELPER = require('../../utils/helper')
const APP_CONSTANTS = require('../../config/appConstants')
const async = require('async')
const ERROR = APP_CONSTANTS.STATUS_MSG.ERROR


var updateNotificationsStatus = function (userData, data, cb) {
  const notificationIds = JSON.parse(data.data)
  var criteria = {  _id: { $in: notificationIds } ,userId: userData._id }
  var dataToSet = { readStatus: true }
  UserNotificationService.updateAllRecords(criteria, dataToSet, {}, function (err, num) {
    if (err) return cb(err)
    console.log(num)
    cb(null, {updatedRecords :num.nModified})
  })
}
 
module.exports = {
  updateNotificationsStatus: updateNotificationsStatus
}
