'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const autoIncrementModelID = require('./counterModel');

// This is not named as 'module' like other models since 'module' is a reserved word
var moduleSchema = new Schema({
  id: { type: Number, unique: true, min: 1 },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
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
  tasks: [ Number ],
  activities: [ Number ],
  goals: [ Number ],
  refreshers: [ Number ],
  pills: [ Number ],
  notifications: [ Number ],
  prerequisities: {
    modules: [ Number ],
    goals: [ Number ]
  }
});

moduleSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID('modules', this, next);
});

module.exports = mongoose.model('module', moduleSchema);
