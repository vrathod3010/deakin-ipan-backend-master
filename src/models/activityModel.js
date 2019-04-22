'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const autoIncrementModelID = require('./counterModel');

var activitySchema = new Schema({
  id: { type: Number, unique: true, min: 1 },
  title: { type: String },
  shortDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  sections: [
    {
      type: { type: String, required: true, enum: ['TEXT', 'VIDEO', 'IMAGE'] },
      data: {
        value: { type: String, required: true },
        misc: [
          { 
            key: { type: String, required: true },
            value: { }
          }
        ]
      }
    }
  ]
});

activitySchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID('activities', this, next);
});

module.exports = mongoose.model('activity', activitySchema);
