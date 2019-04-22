'use strict'

const debug = require('debug')('app:seed')
const async = require('async')
const jsonfile = require('jsonfile')
debug("Seeding database for test environment..")

const db = require('./src/config/database')(process.env.NODE_ENV)
const DB_HELPER = require('./src/utils/dbHelper')
const HELPER = require('./src/utils/helper')
const DEFAULTS_MANAGER = require('./src/lib/defaultsManager')

const GenericDBService = require('./src/genricDBService')
const ActivityService = new GenericDBService("Activity")
const TaskService = new GenericDBService("Task")
const ModuleService = new GenericDBService("Module")
const ProgramService = new GenericDBService("Program")
const UserService = new GenericDBService("User")
const UserNotificationService = new GenericDBService("UserNotification")
const NotificationDefinitionService = new GenericDBService("NotificationDefinition")

const userNotificationObj1 = {
  appLink: "/programs/1/modules/1",
  text: "Notification ", // text of the notification
}

var jsonActivities = [],
    jsonTasks = [],
    jsonModules = [],
    jsonPrograms = [],
    jsonNotificationDefinitions = [],
    jsonNewUserSkeleton = {}

const activitiesFile = './.seed_data/activities.json',
      tasksFile = './.seed_data/tasks.json',
      modulesFile = './.seed_data/modules.json',
      programsFile = './.seed_data/programs.json',
      notificationDefinitionsFile = './.seed_data/notificationDefinitions.json',
      usersFile = './.seed_data/users.json',
      newUserSkeletonFile = './newUserSkeleton.json'

const initialiseDB = function (callback) {
  debug("Init db inside seed..")
  
  var allUsers = [], ei = 0

  async.series([
    function (cb) {
      jsonfile.readFile(activitiesFile, 'utf8', function (err, data) {
        if (err) return cb()
        jsonActivities = data
        cb()
      });
    },
    function (cb) {
      jsonfile.readFile(tasksFile, 'utf8', function (err, data) {
        if (err) return cb()
        jsonTasks = data
        cb()
      });
    },
    function (cb) {
      jsonfile.readFile(modulesFile, 'utf8', function (err, data) {
        if (err) return cb()
        jsonModules = data
        cb()
      });
    },
    function (cb) {
      jsonfile.readFile(programsFile, 'utf8', function (err, data) {
        if (err) return cb()
        jsonPrograms = data
        cb()
      });
    },
    function (cb) {
      jsonfile.readFile(newUserSkeletonFile, 'utf8', function (err, data) {
        if (err) return cb()
        jsonNewUserSkeleton = data
        cb()
      });
    },
    function (cb) {
      jsonfile.readFile(notificationDefinitionsFile, 'utf8', function (err, data) {
        if (err) return cb()
        jsonNotificationDefinitions = data
        cb()
      });
    },


    function (cb) {
      ActivityService.insertManyAsync(jsonActivities, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    function (cb) {
      TaskService.insertManyAsync(jsonTasks, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    function (cb) {
      ModuleService.insertManyAsync(jsonModules, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    function (cb) {
      ProgramService.insertManyAsync(jsonPrograms, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    function (cb) {
      NotificationDefinitionService.insertManyAsync(jsonNotificationDefinitions, function (err) {
        if (err) return cb(err)
        cb()
      })
    },
    function (cb) {
      /**
       * From users.json file:
       * Read email and password data from that file for each user
       * Encrypt the password for each user if there is any
       * Save everything
       */

      jsonfile.readFile(usersFile, 'utf8', function (err, data) {
        if (err) return cb()

        for (var i = 0; i < data.length; ++i) {
          if (!data[i].emailId && "" !== data[i].emailId.trim()) return cb(err)

          allUsers[ei] = JSON.parse(JSON.stringify(jsonNewUserSkeleton));

          if (data[i]._id) allUsers[ei]._id = data[i]._id
          allUsers[ei].id = i + 1
          allUsers[ei].emailId = data[i].emailId.toLowerCase()
          allUsers[ei].password = HELPER.CryptData(data[i].password || allUsers[ei].password)

          if (data[i].firstName) allUsers[ei].firstName = data[i].firstName
          if (data[i].lastName) allUsers[ei].lastName = data[i].lastName

          if (data[i].mobile) allUsers[ei].mobile = data[i].mobile

          if (data[i].profile) {
            if(data[i].profile.favouriteTasks) allUsers[ei].profile.favouriteTasks = data[i].profile.favouriteTasks
            if(data[i].profile.favouriteActivities) allUsers[ei].profile.favouriteActivities = data[i].profile.favouriteActivities
            if(data[i].profile.favouriteModules) allUsers[ei].profile.favouriteModules = data[i].profile.favouriteModules
            if(data[i].profile.programsData) allUsers[ei].profile.programsData = data[i].profile.programsData
          }

          if (data[i].accessToken) allUsers[ei].accessToken = data[i].accessToken
          ei++
        }
        cb()

      });
    },
    function (cb) {
      DEFAULTS_MANAGER.processDefaults("programs", "modules", [...allUsers], (err, data) => {
        if (err) return cb (err)
        
        cb()
      })
    },
    function (cb) {
      UserService.insertManyAsync([...allUsers], function (err, data) {
        if (err) return cb(err)

        allUsers = data
        cb()
      })
    },
    function (cb) {
      /**
       * We need to insert 10 notifications for each user
       * For testing, each notification's visit link will be comprised of VISIT_LINK constant, user number 
       * and notification number, for example:
       * aaaau1n1, aaaau1n2, aaaau1n3, aaaau2n1, aaaau2n2, aaaau2n3, ...
       */


      // Initialising date here will compensates for lost time during previous db inserts
      const date = new Date()
      userNotificationObj1.timestamp = (new Date(date.getTime() + 10000)).toISOString()

      // This will store all the notifications for all the users
      var allUsersAllNotifications = []

      for (var i = 0; i < ei; ++i) {

        allUsersAllNotifications[i] = []

        for (var j = 0; j < 10; ++j) {
          allUsersAllNotifications[i][j] = Object.assign({}, userNotificationObj1)
          allUsersAllNotifications[i][j].text += j + 1
          allUsersAllNotifications[i][j].userId = allUsers[i]._id

          if (j > 4)
            allUsersAllNotifications[i][j].deliverDateTime = (new Date(date.getTime() + (j - 2) * 60000 - 20000)).toISOString()
          else
            allUsersAllNotifications[i][j].deliverDateTime = (new Date(date.getTime() + (j + 1) * 20000)).toISOString()
        }
      }

      const flattenedAllUserNotifications = [].concat(...allUsersAllNotifications);

      UserNotificationService.insertManyAsync(flattenedAllUserNotifications, function (err) {
        if (err) return cb(err)
        cb()
      })
    }

  ],
    function (err) {
      if (err) return callback(err)
      callback()
    }
  )
}

const destroyDB = function (callback) {
  debug("Destroying database first..")
  DB_HELPER.dropDatabase(db, (err) => {
    if (err) return callback(err)
    callback()
  })
}

const setup = function (callback) {
  debug("Establishing db connection inside seed..")
  async.series([
    function (cb) {
      destroyDB((err) => {
        if (err) return cb(err)
        cb()
      })
    },
    function (cb) {
      initialiseDB((err) => {
        if (err) return cb(err)
        cb()
      })
    }
  ], function (err) {
    if (err) return callback(err)
    callback(null, { message: "Everything is working!" })
  })
}

module.exports = (cb) => {
  setup((err, data) => {
    if (err) return debug(err)
    debug(data.message)
    cb() // callback from server.js
  })
}
