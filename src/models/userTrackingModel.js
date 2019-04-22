'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EVENTS_ENUM = Object.values(require('../lib/eventHandler').EVENTS)
const MISC_KEY_ENUM = [
  'PREVIOUS_TRACKER_ID',
  'LINK'
]

const userTrackingSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },

  data: [{
    event: { type: String, required: true, enum: EVENTS_ENUM },
    time: { type: Date, required: true },
    url: { type: String, required: true }, // TODO: Add regex

    userId: { type: Number },

    misc: [{
      key: { type: String, required: true, enum: MISC_KEY_ENUM },
      value: { type: String, required: true }
    }]
  }]
})

module.exports = mongoose.model('userTracking', userTrackingSchema)
