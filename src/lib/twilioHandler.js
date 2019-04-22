const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require("twilio")(accountSid, authToken)
const async = require('async')
const services = require("../services")
const UserService = services.UserService
const HELPER = require("../utils/helper")

const notifyUser = function (userID, notificationData, cb) {
  let message = notificationData.text ? `${notificationData.text} Click here: ${HELPER.sanitizedUrl(process.env.FRONTEND_URL)}/notifications/${notificationData.visitLink}` : notificationData.text
  let userNumber
  async.series([
    function(cb) {
      let criteria = { id: notificationData.userId }
      let projection = { mobile: 1 }
      UserService.getRecord(criteria, projection, {}, (err, data) => {
        if (err) return cb(err)

        userNumber = data[0].mobile
        console.log(userNumber)
        cb()
      })
    },
    function(cb) {
      client.messages.create({
        body: message,
        from: process.env.TWILIO_NUMBER,
        to: `+${userNumber}`
      })
      .then(data => {
        console.log(data)
      })
      .catch(e => {
        console.log(e)
      })
      cb()
    }
  ],
  function(err) {
    if (err) return cb(err)
    
    cb()
  }
  )
}

module.exports = {
  notifyUser: notifyUser
}
