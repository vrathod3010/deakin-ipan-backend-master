'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const autoIncrementModelID = require('./counterModel')

const crypto = require('crypto')
const base64url = require('base64url')

const userNotificationSchema = new Schema({
  id: { type: Number, unique: true, min: 1 },
  visitLink: { type: String, unique: true, required: true, default: function() {
    return generatePRLink()
  } }, // the notification link for SMS's, email, etc
  appLink: { type: String }, // the link this notification directs to inside the application

  userId: { type: Schema.Types.ObjectId, required: true }, // the user to whom the notification needs to be sent
  deliverDateTime: { type: Date, required: true }, // actual time when to send this notification
  text: { type: String, required: true }, // text of the notification

  readStatus: { type: Boolean, default: false }, // read or unread

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date } // time when the user reads the notification
})

function generatePRLink() {
  return base64url(crypto.randomBytes(6))
}

userNotificationSchema.pre('save', function (next) {
  if (!this.isNew) {
    next()
    return
  }

  autoIncrementModelID('userNotifications', this, next)
})

module.exports = mongoose.model('userNotification', userNotificationSchema)
