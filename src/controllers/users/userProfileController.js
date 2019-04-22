'use strict'

const GenericDBService = require('../../genricDBService')
const UserService = new GenericDBService("User")
const HELPER = require('../../utils/helper')
const APP_CONSTANTS = require('../../config/appConstants')
const async = require('async')
const ERROR = APP_CONSTANTS.STATUS_MSG.ERROR

var getProfile = function (userData, cb) {
  var criteria = { _id: userData._id }
  UserService.getRecord(criteria, {}, {}, function (err, data) {
    if (err) return cb(err)
    if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)
    if (!data[0].profile) return cb(ERROR.IMP_ERROR)

    const user = data[0]
    const fetchData = {
      firstName:  user.firstName,
      lastName:   user.lastName,
      email:      user.emailId,
      dob:        user.profile.dob,
      mobile:     user.mobile,
      gender:     user.profile.gender
    }
    cb(null, {profile: fetchData})
  })
}

module.exports = {
  getProfile: getProfile
}
