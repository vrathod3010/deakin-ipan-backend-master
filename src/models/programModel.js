'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const autoIncrementModelID = require('./counterModel');

var programSchema = new Schema({
  id: { type: Number, unique: true, min: 1 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverPhoto: { type: String, required: true },
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
  ],
  modules: [ Number ],
  modulesMap: [
    {
      key: { type: Number, required: true },
      value: { type: Array, required: true }
    }
  ]
});

programSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID('programs', this, next);
});

module.exports = mongoose.model('program', programSchema);
