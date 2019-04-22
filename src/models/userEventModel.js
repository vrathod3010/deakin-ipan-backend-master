'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const autoIncrementModelID = require('./counterModel')

const userEventSchema = new Schema({
  id: { type: Number, unique: true, min: 1 },

  userId: { type: Schema.Types.ObjectId, required: true },
  events: [
    {
      name: { type: String, required: true }, // name of the event
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
})

userEventSchema.pre('save', function (next) {
  if (!this.isNew) {
    next()
    return
  }

  autoIncrementModelID('userEvents', this, next)
})

module.exports = mongoose.model('userEvent', userEventSchema)
