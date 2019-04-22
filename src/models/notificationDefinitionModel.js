'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const autoIncrementModelID = require('./counterModel')

const notificationDefinitionSchema = new Schema({
  id: { type: Number, unique: true, min: 1 },
  
  message: { type: String, required: true }, // text of the notification
  appLink: { type: String }, // the link this notification directs to inside the application

  trigger: { type: String, required: true }, // event name
  deliveryTime: {
    type: { type: String, required: true, enum: ["ABSOLUTE", "RELATIVE", "INSTANT"], default: "INSTANT" },
    value: { type: String }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
})

const NOT_EMPTY = ' cannot be empty'

notificationDefinitionSchema.pre('validate', function(next) {
  if (this.deliveryTime.type === 'INSTANT') return next()
  if (!this.deliveryTime.value) return next(new Error('DELIVERY_TIME VALUE' + NOT_EMPTY))

  next()
})

notificationDefinitionSchema.pre('save', function (next) {
  if (!this.isNew) {
    next()
    return
  }

  autoIncrementModelID('notificationDefinitions', this, next)
})

module.exports = mongoose.model('notificationDefinition', notificationDefinitionSchema)
