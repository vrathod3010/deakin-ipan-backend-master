"use strict";

const defaultsConfig = require("../../yamlObjects").defaults;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const autoIncrementModelID = require("./counterModel");

/**
 * TODO: Get default status for everything from a config
 */

// This is a JSON and not a model unlike every other model since we are appending to this JSON in test env.
var userJSON = {
  id: { type: Number, unique: true, min: 1 },
  fsid: { type: String, unique: true },
  firstName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 16
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 16
  },
  // TODO: Add email format validation regex. Note: API is already protected
  emailId: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 64
  },
  accessToken: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true
  },
  // TODO:
  // Add regex to password which ensures that the password
  // contains at least 1 upper-case character, 1 digit and 1 special character
  password: { type: String, trim: true, required: true, minlength: 8 },
  // salt: { type: String }, // TODO: Add salt security later
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  mobile: { type: String, trim: true, minlength: 11, maxlength: 12 }, // TODO: Make this unique after testing
  profile: {
    dob: { type: String, trim: true },
    gender: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ["MALE", "FEMALE", "OTHER"]
    },
    programsData: [
      {
        programId: { type: Number, required: true },

        status: {
          type: String,
          enum: ["COMPLETE", "ACTIVE", "UNLOCKED", "LOCKED"],
          default: defaultsConfig.programsStatus().toUpperCase()
        },
        read: { type: Boolean, default: false }, // setting this true or false shouldn't affect the selective forest walk

        updatedAt: { type: Date },
        completedModulesCount: { type: Number, min: 0, default: 0 },
        modules: [
          {
            moduleId: { type: Number, required: true },

            status: {
              type: String,
              enum: ["COMPLETE", "ACTIVE", "UNLOCKED", "LOCKED"],
              default: defaultsConfig.modulesStatus().toUpperCase()
            },
            read: { type: Boolean, default: false }, // setting this true or false shouldn't affect the selective forest walk

            updatedAt: { type: Date },
            goalStatus: { type: Boolean },
            goals: [Number],
            activities: [
              {
                activityId: { type: Number, required: true },
                status: {
                  type: String,
                  enum: ["COMPLETE", "ACTIVE", "UNLOCKED", "LOCKED"],
                  default: defaultsConfig.activitiesStatus().toUpperCase()
                },
                updatedAt: { type: Date }
              }
            ],
            tasks: [
              {
                taskId: { type: Number, required: true },
                status: {
                  type: String,
                  enum: ["COMPLETE", "ACTIVE", "UNLOCKED", "LOCKED"],
                  default: defaultsConfig.tasksStatus().toUpperCase()
                },
                updatedAt: { type: Date },
                submissions: [
                  {
                    createdAt: { type: Date, default: Date.now },
                    data: [
                      {
                        questionId: { type: Number, required: true },
                        answeredOptionId: { type: Number, required: true }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    favouriteModules: [
      {
        programId: { type: Number },
        id: { type: Number, required: true }
      }
    ],
    favouriteActivities: [
      {
        programId: { type: Number },
        moduleId: { type: Number },
        id: { type: Number, required: true }
      }
    ],
    favouriteTasks: [
      {
        programId: { type: Number },
        moduleId: { type: Number },
        id: { type: Number, required: true }
      }
    ],
    calendar: []
  }
};

/**
 * Appends the user schema JSON with the _id field for test environment.
 * Helpful since accessToken can be a predefined constant while testing.
 * */
if ("test" === process.env.NODE_ENV)
  userJSON._id = {
    type: Schema.ObjectId,
    default: function() {
      return new mongoose.mongo.ObjectId();
    }
  };

const userSchema = new Schema(userJSON);

userSchema.pre("save", function(next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID("users", this, next);
});

module.exports = mongoose.model("user", userSchema);
