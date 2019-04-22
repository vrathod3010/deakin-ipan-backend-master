'use strict'

const GenericDBService = require('../../genricDBService')
const UserService = new GenericDBService("User")
const ProgramService = new GenericDBService("Program")
const ModuleService = new GenericDBService("Module")
const ActivityService = new GenericDBService("Activity")
const TaskService = new GenericDBService("Task")
const HELPER = require('../../utils/helper')
const APP_CONSTANTS = require('../../config/appConstants')
const async = require('async')
const ERROR = APP_CONSTANTS.STATUS_MSG.ERROR

/**
[
  {
    program: {
      id: 1,
      title: 'Respective program title'
    },
    module: {
      id: 1,
      title: "Everyone can play!",
      shortDescription: "Active play is important for everyone in the family: adults and…",
      status: 'Incomplete',
      goalStatus: true,
    }
  }
]
 */
const getFavouriteModules = function (userData, callback) {
  var fetchData = []
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)
        
        if (data[0].profile.favouriteModules.length === 0) return callback()
        data[0].profile.favouriteModules.forEach((userFavItem) => {
          var tempFavourite = {}
          tempFavourite.program = { id: userFavItem.programId }
          const userProgramModuleData = data[0].profile.programsData
                                        .find((program) => userFavItem.programId === program.programId).modules
                                        .find((mod) => userFavItem.id === mod.moduleId)

          /**
           * TODO: Add goalStatus
           */

          tempFavourite.module = {
            id: userFavItem.id,
            status: userProgramModuleData.status
          }

          fetchData.push(tempFavourite)
        })

        cb()
      })
    },
    // Set program.title for each entry in fetchData
    function (cb) {
      var programIdsArr = []
      fetchData.forEach((favouriteItem) => programIdsArr.push(favouriteItem.program.id))

      var criteria = { id: { $in: programIdsArr} }
      var projection = ''

      ProgramService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAMS NOT FOUND")

        // For each program found, append it's title to respective fetchData's program.title
        data.forEach((program) => {
          const foundIndex = fetchData.findIndex((userFavItem) => userFavItem.program.id === program.id)
          if (foundIndex === -1) return // stop processing this iteration
          
          fetchData[foundIndex].program.title = program.title

        })

        cb()
      })
    },
    // Set module.title, shortDescription for each entry in fetchData
    function (cb) {
      var moduleIdsArr = []
      fetchData.forEach((favouriteItem) => moduleIdsArr.push(favouriteItem.module.id))

      var criteria = { id: { $in: moduleIdsArr } }
      var projection = ''

      ModuleService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULES NOT FOUND")

        // For each module found, append it's title to respective fetchData's module.title, shortDescription
        data.forEach((mod) => {
          const foundIndex = fetchData.findIndex((userFavItem) => userFavItem.module.id === mod.id)
          if (foundIndex === -1) return // stop processing this iteration

          fetchData[foundIndex].module.title = mod.title
          fetchData[foundIndex].module.shortDescription = mod.shortDescription

        })
        
        cb()
      })
    },
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { favouriteModules: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

// Mongo doc: https://docs.mongodb.com/manual/reference/operator/update/push/
function addToFav(criteria, arrayName, requiredFav, cb) {
  var updateStatement = {}
  const str = 'profile.' + arrayName
  updateStatement.$push = {}
  updateStatement.$push[str] = requiredFav
  UserService.updateRecord(criteria, updateStatement, {}, function (err, data) {
    if (err) return cb(err)
    cb(null, "FAVOURITE ADDED")
  })
}

// Mongo doc: https://docs.mongodb.com/manual/reference/operator/update/pull/
function removeFromFav(criteria, arrayName, requiredFav, cb) {
  var updateStatement = {}
  const str = 'profile.' + arrayName
  updateStatement.$pull = {}
  updateStatement.$pull[str] = requiredFav
  UserService.updateRecord(criteria, updateStatement, {}, function (err, data) {
    if (err) return cb(err)
    cb(null, "FAVOURITE DELETED")
  })
}

const toggleFavouriteModule = function (userData, request, callback) {
  /**
   * Read programId and moduleId from request data
   * If that favourite exists, remove it
   * Else check if the favourite IDs are existing in user model and add that favourite
   * 
   * TODO: Maybe send the new list.. :D
   */
  var fetchData = []
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)

        var requiredFav = {
          id: request.params.id,
          programId: request.query.programId
        }

        // Check if the required favourite IDs are existing in user's programs data

        const requiredProgram = data[0].profile.programsData
                                .find((program) => requiredFav.programId === program.programId)
        if (undefined === requiredProgram) return cb("PROGRAM NOT FOUND")
        
        const requiredModule = requiredProgram.modules
                                .find((mod) => requiredFav.id === mod.moduleId)
        if (undefined === requiredModule) return cb("MODULE NOT FOUND")
        
        const arrayName = 'favouriteModules'

        if (data[0].profile.favouriteModules.length === 0) 
          return addToFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // ADD TO FAVOURITES

        const favouriteExists = data[0].profile.favouriteModules.filter(function(userFavItem) {
          return  userFavItem.programId === request.query.programId && 
                  userFavItem.id === request.params.id
        }).length > 0

        if (!favouriteExists)
          return addToFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // ADD TO FAVOURITES

        else 
          return removeFromFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // REMOVE FROM FAVOURITES

      })
    }
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { message: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

const getFavouriteActivities = function (userData, callback) {
  var fetchData = []
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)
        
        if (data[0].profile.favouriteActivities.length === 0) return callback()
        data[0].profile.favouriteActivities.forEach((userFavItem) => {
          var tempFavourite = {}
          tempFavourite.program = { id: userFavItem.programId }
          tempFavourite.module = { id: userFavItem.moduleId }
          const userProgramModuleActivityData = data[0].profile.programsData
                                                .find((program) => userFavItem.programId === program.programId).modules
                                                .find((mod) => userFavItem.moduleId === mod.moduleId).activities
                                                .find((activity) => userFavItem.id === activity.activityId)

          /**
           * TODO: Add goalStatus
           */

          tempFavourite.activity = {
            id: userFavItem.id,
            status: userProgramModuleActivityData.status
          }

          fetchData.push(tempFavourite)
        })

        cb()
      })
    },
    // Set module.title for each entry in fetchData
    function (cb) {
      var moduleIdsArr = []
      fetchData.forEach((favouriteItem) => moduleIdsArr.push(favouriteItem.module.id))

      var criteria = { id: { $in: moduleIdsArr } }
      var projection = ''

      ModuleService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULES NOT FOUND")

        // For each module found, append it's title to respective fetchData's module.title
        data.forEach((mod) => {
          const foundIndex = fetchData.findIndex((userFavItem) => userFavItem.module.id === mod.id)
          if (foundIndex === -1) return // stop processing this iteration

          fetchData[foundIndex].module.title = mod.title

        })

        cb()
      })
    },
    // Set activity.title, shortDescription for each entry in fetchData
    function (cb) {
      var activityIdsArr = []
      fetchData.forEach((favouriteItem) => activityIdsArr.push(favouriteItem.activity.id))

      var criteria = { id: { $in: activityIdsArr } }
      var projection = ''

      ActivityService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULES NOT FOUND")

        // For each activity found, append it's title to respective fetchData's activity.title, shortDescription
        data.forEach((activity) => {
          const foundIndex = fetchData.findIndex((userFavItem) => userFavItem.activity.id === activity.id)
          if (foundIndex === -1) return // stop processing this iteration

          fetchData[foundIndex].activity.title = activity.title
          fetchData[foundIndex].activity.shortDescription = activity.shortDescription

        })
        
        cb()
      })
    },
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { favouriteActivities: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

const toggleFavouriteActivity = function (userData, request, callback) {
  var fetchData = []
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)

        var requiredFav = {
          id: request.params.id,
          moduleId: request.query.moduleId,
          programId: request.query.programId
        }

        // Check if the required favourite IDs are existing in user's programs data

        const requiredProgram = data[0].profile.programsData
                                .find((program) => requiredFav.programId === program.programId)
        if (undefined === requiredProgram) return cb("PROGRAM NOT FOUND")
        
        const requiredModule = requiredProgram.modules
                                .find((mod) => requiredFav.moduleId === mod.moduleId)
        if (undefined === requiredModule) return cb("MODULE NOT FOUND")

        const requiredActivity = requiredModule.activities
                                .find((activity) => requiredFav.id === activity.activityId)
        if (undefined === requiredActivity) return cb("ACTIVITY NOT FOUND")
        
        const arrayName = 'favouriteActivities'

        if (data[0].profile.favouriteActivities.length === 0) 
          return addToFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // ADD TO FAVOURITES

        const favouriteExists = data[0].profile.favouriteActivities.filter(function(userFavItem) {
          return  userFavItem.programId === request.query.programId && 
                  userFavItem.moduleId === request.query.moduleId && 
                  userFavItem.id === request.params.id
        }).length > 0

        if (!favouriteExists)
          return addToFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // ADD TO FAVOURITES

        else 
          return removeFromFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // REMOVE FROM FAVOURITES

      })
    }
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { message: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

const getFavouriteTasks = function (userData, callback) {
  var fetchData = []
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)
        
        if (data[0].profile.favouriteTasks.length === 0) return callback()
        data[0].profile.favouriteTasks.forEach((userFavItem) => {
          var tempFavourite = {}
          tempFavourite.program = { id: userFavItem.programId }
          tempFavourite.module = { id: userFavItem.moduleId }
          const userProgramModuleTaskData = data[0].profile.programsData
                                                .find((program) => userFavItem.programId === program.programId).modules
                                                .find((mod) => userFavItem.moduleId === mod.moduleId).tasks
                                                .find((task) => userFavItem.id === task.taskId)

          /**
           * TODO: Add goalStatus
           */

          tempFavourite.task = {
            id: userFavItem.id,
            status: userProgramModuleTaskData.status
          }

          fetchData.push(tempFavourite)
        })

        cb()
      })
    },
    // Set module.title for each entry in fetchData
    function (cb) {
      var moduleIdsArr = []
      fetchData.forEach((favouriteItem) => moduleIdsArr.push(favouriteItem.module.id))

      var criteria = { id: { $in: moduleIdsArr } }
      var projection = ''

      ModuleService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULES NOT FOUND")

        // For each module found, append it's title to respective fetchData's module.title
        data.forEach((mod) => {
          const foundIndex = fetchData.findIndex((userFavItem) => userFavItem.module.id === mod.id)
          if (foundIndex === -1) return // stop processing this iteration

          fetchData[foundIndex].module.title = mod.title

        })

        cb()
      })
    },
    // Set task.title, shortDescription for each entry in fetchData
    function (cb) {
      var taskIdsArr = []
      fetchData.forEach((favouriteItem) => taskIdsArr.push(favouriteItem.task.id))

      var criteria = { id: { $in: taskIdsArr } }
      var projection = ''

      TaskService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULES NOT FOUND")

        // For each activity found, append it's title to respective fetchData's task.title, shortDescription
        data.forEach((task) => {
          const foundIndex = fetchData.findIndex((userFavItem) => userFavItem.task.id === task.id)
          if (foundIndex === -1) return // stop processing this iteration

          fetchData[foundIndex].task.title = task.title
          fetchData[foundIndex].task.shortDescription = task.shortDescription

        })
        
        cb()
      })
    },
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { favouriteTasks: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

const toggleFavouriteTask = function (userData, request, callback) {
  var fetchData = []
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)

        var requiredFav = {
          id: request.params.id,
          moduleId: request.query.moduleId,
          programId: request.query.programId
        }

        // Check if the required favourite IDs are existing in user's programs data

        const requiredProgram = data[0].profile.programsData
                                .find((program) => requiredFav.programId === program.programId)
        if (undefined === requiredProgram) return cb("PROGRAM NOT FOUND")
        
        const requiredModule = requiredProgram.modules
                                .find((mod) => requiredFav.moduleId === mod.moduleId)
        if (undefined === requiredModule) return cb("MODULE NOT FOUND")

        const requiredTask = requiredModule.tasks
                                .find((task) => requiredFav.id === task.taskId)
        if (undefined === requiredTask) return cb("ACTIVITY NOT FOUND")
        
        const arrayName = 'favouriteTasks'

        if (data[0].profile.favouriteTasks.length === 0) 
          return addToFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // ADD TO FAVOURITES

        const favouriteExists = data[0].profile.favouriteTasks.filter(function(userFavItem) {
          return  userFavItem.programId === request.query.programId && 
                  userFavItem.moduleId === request.query.moduleId && 
                  userFavItem.id === request.params.id
        }).length > 0

        if (!favouriteExists)
          return addToFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // ADD TO FAVOURITES

        else 
          return removeFromFav(criteria, arrayName, requiredFav, (err, data) => {
            if (err) return cb(err)
            fetchData = data
            cb()
          }) // REMOVE FROM FAVOURITES

      })
    }
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { message: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

module.exports = {
  getFavouriteActivities: getFavouriteActivities,
  toggleFavouriteActivity: toggleFavouriteActivity,

  getFavouriteModules: getFavouriteModules,
  toggleFavouriteModule: toggleFavouriteModule,
  
  getFavouriteTasks: getFavouriteTasks,
  toggleFavouriteTask: toggleFavouriteTask
}
