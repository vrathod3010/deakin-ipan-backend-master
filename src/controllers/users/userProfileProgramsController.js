'use strict'

const SERVICES = require('../../services.js')
const UserService = SERVICES.UserService
const ProgramService = SERVICES.ProgramService
const ModuleService = SERVICES.ModuleService
const ActivityService = SERVICES.ActivityService
const TaskService = SERVICES.TaskService
const HELPER = require('../../utils/helper')
const APP_CONSTANTS = require('../../config/appConstants')
const WALK = require('../../lib/selectiveForestWalk.js')
const walkConfig = require('../../../yamlObjects').walk
const async = require('async')
const ERROR = APP_CONSTANTS.STATUS_MSG.ERROR
const CUSTOM_ERROR_404 = APP_CONSTANTS.CUSTOM_ERROR_404

/**
 * GET /user/programs
 * 
 * @param {*} userData 
 * @param {*} callback 
 */
var getUserProfilePrograms = function (userData, callback) {
  var fetchData
  var userProgramsData
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.INCORRECT_ACCESSTOKEN)
        
        if (!data[0].profile.programsData) return cb(ERROR.IMP_ERROR)
        fetchData = data[0].profile
        cb()
      })
    },
    function (cb) {
      if (0 >= fetchData.programsData.length) return cb("NO PROGRAMS REGISTERED YET")

      var userProgramsArr = []
      fetchData.programsData.forEach((program) => userProgramsArr.push(program.programId))
      
      var criteria = { id: { $in: userProgramsArr } }

      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        
        /** 
         * From userProgramsData, for each program, add: 
         * [X] status
         * [X] progress count of modules
         * [X] total number of modules
         */

        userProgramsData = data
        userProgramsData.forEach((program) => {
          HELPER.deleteUnnecessaryUserData(program)
          delete program.modules

          const userProgram = fetchData.programsData.find((userProgram) => userProgram.programId === program.id)
          program.status = userProgram.status
          program.progress = userProgram.completedModulesCount
          program.total = userProgram.modules.length
        })

        cb()
      })
    }
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { programs: HELPER.deleteUnnecessaryUserData(userProgramsData) })
  }
  )
}

/**
 * GET /user/programs/id
 * 
 * Get a specific user program's data, which includes **minimum** information about the modules as well.
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} callback Callback function to call
 */
var getUserProfileProgram = function (userData, params, callback) {
  var fetchData
  var userProgramData = {}
  async.series([
    function (cb) {
      var criteria = { _id: userData._id, "profile.programsData": {"$elemMatch": {"programId": params.id}} }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND)

        userProgramData = data[0].profile.programsData.find((program) => params.id === program.programId)
        userProgramData.favouriteModules = data[0].profile.favouriteModules
        userProgramData.favouriteModules.forEach((userFavMod) => delete userFavMod._id)
        cb()
      })
    },
    function (cb) {
      const criteria = { id: params.id }
      const projection = { modulesMap: 0 }
      ProgramService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        
        fetchData = HELPER.deleteUnnecessaryUserData(data[0])
        cb()
      })
    },
    function (cb) {

      const userModulesIDArr = userProgramData.modules.map((userMod) => userMod.moduleId)
      fetchData.modules = fetchData.modules.filter(mod => userModulesIDArr.includes(mod))

      var criteria = { id: { $in: fetchData.modules } }
      var modulesProjection = {
        _id: 0,
        __v: 0,
        prerequisities: 0,
        notifications: 0,
        pills: 0,
        refreshers: 0
      }
      
      ModuleService.getRecord(criteria, modulesProjection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("NO MODULES FOUND")

        fetchData.modules = data
        
        /** 
         * TODO: From user's programData, for each module, add: 
         * [X]  status
         * []  goalStatus
         * [X]  favouriteStatus 
         */

        fetchData.modules.forEach((mod) => {
          mod.status = userProgramData.modules.find((userMod) => userMod.moduleId === mod.id).status
          
          if (0 === userProgramData.favouriteModules.length) return
          
          mod.favouriteStatus = userProgramData.favouriteModules.filter(function(userFavMod) {
            return userFavMod.programId === params.id && userFavMod.id === mod.id
          }).length > 0
        })
        cb()
      })
    }
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { programs: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

/**
 * GET /user/programs/programId/modules/id
 * 
 * Get a specific user program's module data, which includes information about the activities and 
 * tasks chosen by the user as well as the resources for that module.
 * 
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} callback Callback function to call
 */
var getUserProfileProgramModule = function (userData, params, callback) {
  var fetchData = {}
  var userProgramModuleData = {}
  async.series([
    function (cb) {

      var criteria = { 
        _id: userData._id, 
        "profile.programsData": {
          "$elemMatch": {
            "programId": params.programId, 
            "modules": {"$elemMatch": {"moduleId": params.id}}
          }
        } 
      }

      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND)
        
        userProgramModuleData = data[0].profile.programsData
                                .find((program) => params.programId === program.programId).modules
                                .find((mod) => params.id === mod.moduleId)

        userProgramModuleData.favouriteStatus = data[0].profile.favouriteModules.filter(function(userFavMod) {
          return userFavMod.programId === params.programId && userFavMod.id === params.id
        }).length > 0

        userProgramModuleData.favouriteTasks = data[0].profile.favouriteTasks

        userProgramModuleData.favouriteActivities = data[0].profile.favouriteActivities

        cb()
      })

    },
    function (cb) {
      var criteria = {id: params.programId}
      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        if (undefined === data[0].modules.find((mod) => params.id === mod)) return cb("This program doesn't have that module")

        cb()
      })
    },
    function (cb) {
      var criteria = { id: params.id }
      ModuleService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULE NOT FOUND")

        fetchData = HELPER.deleteUnnecessaryUserData(data[0])
        fetchData.favouriteStatus = userProgramModuleData.favouriteStatus
        fetchData.status = userProgramModuleData.status
        cb()
      })
    },
    // Get list of activities belonging to a module that a user chose to complete
    function (cb) {
      /**
       * If userProgramModuleData.activities.length === 0, return cb() without an error
       * Fetch all the activities in userProgramModuleData and put each activity ID in an array
       * Check if all the activity values in that array exist in fetchData of the given module
       * If false, return 500 error
       * Else select the values from activity service and return
       * */ 

      if (userProgramModuleData.activities.length === 0) {
        fetchData.activities = []
        return cb()
      }

      var userProgramModuleActivitiesArr = []
      userProgramModuleData.activities.forEach((activity) => userProgramModuleActivitiesArr.push(activity.activityId))

      if(!userProgramModuleActivitiesArr.every((activity) => fetchData.activities.includes(activity))) 
        // return cb("ONE OF THE ACTIVITIES MISSING")
        return cb(ERROR.IMP_ERROR)

      var criteria = { id: { $in: userProgramModuleActivitiesArr } }
      var projection = 'id title shortDescription'
      ActivityService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("ACTIVITY NOT FOUND")

        data.forEach((activity) => delete activity._id)
        fetchData.activities = data

        /** 
         * From userProgramModuleData, for each activity, add: 
         * [X]  status
         * [X]  favouriteStatus 
         */

        fetchData.activities.forEach((activity) => {
          activity.status = userProgramModuleData.activities.find((userActivity) => userActivity.activityId === activity.id).status

          activity.favouriteStatus = userProgramModuleData.favouriteActivities.filter(function(userFavActivity) {
            return userFavActivity.programId === params.programId && userFavActivity.moduleId === params.id && userFavActivity.id === activity.id
          }).length > 0
        })

        cb()
      })
    },
    // Get list of tasks belonging to a module that a user chose to complete
    function (cb) {
      /**
       * If userProgramModuleData.activities.length === 0, return cb() without an error
       * Fetch all the activities in userProgramModuleData and put each activity ID in an array
       * Check if all the activity values in that array exist in fetchData of the given module
       * If false, return 500 error
       * Else select the values from activity service and return
       * */ 

      if (userProgramModuleData.tasks.length === 0) {
        fetchData.tasks = []
        return cb()
      }

      var userProgramModuleTasksArr = []
      userProgramModuleData.tasks.forEach((task) => userProgramModuleTasksArr.push(task.taskId))

      if(!userProgramModuleTasksArr.every((task) => fetchData.tasks.includes(task))) 
        // return cb("ONE OF THE TASKS MISSING")
        return cb(ERROR.IMP_ERROR)
      
      var criteria = { id: { $in: userProgramModuleTasksArr } }
      var projection = 'id title shortDescription'
      TaskService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("TASK NOT FOUND")

        data.forEach((task) => delete task._id)
        fetchData.tasks = data

        /** 
         * From userProgramModuleData, for each task, add: 
         * [X]  status
         * [X]  favouriteStatus 
         */

        fetchData.tasks.forEach((task) => {
          task.status = userProgramModuleData.tasks.find((userTask) => userTask.taskId === task.id).status

          task.favouriteStatus = userProgramModuleData.favouriteTasks.filter(function(userFavTask) {
            return userFavTask.programId === params.programId && userFavTask.moduleId === params.id && userFavTask.id === task.id
          }).length > 0
        })

        cb()
      })
    }
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { module: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

/**
 * PUT /user/programs/programId/modules/id
 * 
 * Put a specific user program's module data.
 * 
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} callback Callback function to call
 */
var completeUserProfileProgramModule = function (userData, params, callback) {
  var userFetchData = {}
  var userModuleCriteria = {}
  var unlockedModules = []
  var map = {}
  async.series([
    function (cb) {
      userModuleCriteria = { 
        _id: userData._id, 
        "profile.programsData": {
          "$elemMatch": {
            programId: params.programId,
            status: "ACTIVE",
            modules: {"$elemMatch": { moduleId: params.id, status: "ACTIVE" }}
          }
        } 
      }

      UserService.getRecord(userModuleCriteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND)

        cb()
      })
    },
    function (cb) {
      var criteria = {id: params.programId}
      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        if (undefined === data[0].modules.find((mod) => params.id === mod)) return cb("This program doesn't have that module")

        map = data[0].modulesMap
        cb()
      })
    },
    function (cb) {
      var criteria = { id: params.id }
      ModuleService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULE NOT FOUND")

        cb()
      })
    },
    function (cb) {
      let criteria = { _id: userData._id }
      let dataToPut = { "$set": { "profile.programsData.$[p].modules.$[m].status": "COMPLETE" },"$inc":{"profile.programsData.$[p].completedModulesCount": 1 } }
      let options = { "arrayFilters": [ { "p.programId" : params.programId }, { "m.moduleId" : params.id } ] }

      UserService.updateRecord(criteria, dataToPut, options, function (err, data) {
        if (err) return cb(err)
        if (data.profile.programsData.find(p => p.programId === params.programId).modules.find(m => m.moduleId === params.id).status !== "COMPLETE")  return cb("MODULE NOT COMPLETED")
        
        cb()
      })
    },
    function (cb) {
      const criteria = { _id: userData._id }

      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND)
        
        userFetchData = data[0]

        cb()
      })
    },
    function (cb) {
      if (!walkConfig.isEnabled() || walkConfig.getTrigger() !== 'user') return cb()

      WALK(map, userFetchData, params, 'module', (err, data) => {
        if (err) return cb(err)

        if (data && data.length > 0) unlockedModules = data
        cb()
      })
    }
  ],
  function (err) {
    if (err) return callback(err)
    
    let obj = { message: "MODULE COMPLETED" }
    if (unlockedModules.length > 0) obj.unlockedModules = unlockedModules
    callback(null, obj)
  }
  )
}

var activateUserProfileProgramModule = function (userData, params, callback) {
  const userCriteria = { 
    _id: userData._id, 
    "profile.programsData": {
      "$elemMatch": {
        programId: params.programId,
        status: "ACTIVE",
        modules: {"$elemMatch": { moduleId: params.id, status: "UNLOCKED" }}
      }
    } 
  }

  async.series([
    function(cb) {
      /**
       * To check if the given module is activatable:
       * 1. Check if both the program and module exists in that user's records, program is ACTIVE and module with id as params.id has the status unlocked
       * 2. Check if the program with id as params.programId has no module as 'ACTIVE'
       */
      UserService.getRecord(userCriteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND) // Check 1
        if(!data[0].profile.programsData[0].modules.every(mod => mod.status !== "ACTIVE")) cb("EXISTING ACTIVE MODULE") // Check 2
    
        cb()
      })
    },
    function(cb) {
      const dataToPut = { "$set": { "profile.programsData.$[p].modules.$[m].status": "ACTIVE" } }
      const options = { "arrayFilters": [{ "p.programId": params.programId }, { "m.moduleId": params.id }] }

      UserService.updateRecord(userCriteria, dataToPut, options, function (err, data) {
        if (err) return cb(err)
        if (data.profile.programsData.find(p => p.programId === params.programId).modules.find(m => m.moduleId === params.id).status !== "ACTIVE")  return cb("MODULE NOT ACTIVATED")

        cb()
      })
    }
  ],
  function(err) {
    if (err) return callback(err)
    callback(null, { message: "MODULE ACTIVATED" })
  }
  )
}

var getUserProfileProgramModuleResources= function (userData, params, callback) {
  callback(null, 'Not implemented yet')
}

/**
 * GET /user/programs/programId/modules/moduleId/activities/id
 * 
 * Get a specific user program's module's activity's complete data.
 * 
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} callback Callback function to call
 */
var getUserProfileProgramModuleActivity= function (userData, params, callback) {
  var fetchData = {}
  var userProgramModuleActivityData = {}
  async.series([
    function (cb) {

      var criteria = { 
        _id: userData._id, 
        "profile.programsData": {
          "$elemMatch": {
            "programId": params.programId, 
            "modules": {"$elemMatch": {"moduleId": params.moduleId}},
            "modules.activities": {"$elemMatch": {"activityId": params.id}}
          }
        } 
      }

      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND)
        
        // userProgramModuleActivityData.status = data[0].profile.programsData
        //                         .find((program) => params.programId === program.programId).modules
        //                         .find((mod) => params.moduleId === mod.moduleId).activities
        //                         .find((activity) => params.id === activity.activityId).status

        const a = data[0].profile
        if (!a) return cb(CUSTOM_ERROR_404('PROFILE'))
        
        const b = a.programsData
        if (!b) return cb(CUSTOM_ERROR_404('PROGRAMS DATA'))
        
        const c = b.find((program) => params.programId === program.programId)
        if (!c) return cb(CUSTOM_ERROR_404('PROGRAM'))
        
        const d = c.modules
        if (!d) return cb(CUSTOM_ERROR_404('PROGRAM MODULES'))
        
        const e = d.find((mod) => params.moduleId === mod.moduleId)
        if (!e) return cb(CUSTOM_ERROR_404('MODULE'))
        
        const f = e.activities
        if (!f) return cb(CUSTOM_ERROR_404('MODULE ACTIVITIES'))
        
        const g = f.find((activity) => params.id === activity.activityId)
        if (!g) return cb(CUSTOM_ERROR_404('ACTIVITY'))
        
        const h = g.status
        if (!h) return cb(CUSTOM_ERROR_404('ACTIVITY STATUS'))

        userProgramModuleActivityData.status = h
        
        userProgramModuleActivityData.favouriteStatus = data[0].profile.favouriteActivities.filter(function(userFavActivity) {
          return userFavActivity.programId === params.programId && userFavActivity.moduleId === params.moduleId && userFavActivity.id === params.id
        }).length > 0

        cb()
      })

    },
    function (cb) {
      var criteria = {id: params.programId}
      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        if (undefined === data[0].modules.find((mod) => params.moduleId === mod)) return cb("This program doesn't have that module")

        cb()
      })
    },
    function (cb) {
      var criteria = { id: params.moduleId }
      ModuleService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULE NOT FOUND")
        if (undefined === data[0].activities.find((activity) => params.id === activity)) return cb("This module doesn't have that activity")

        cb()
      })
    },
    function (cb) {
      var criteria = { id: params.id }
      var projection = ''
      ActivityService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("ACTIVITY NOT FOUND")

        delete data[0]._id
        fetchData = data[0]
        fetchData.sections.forEach((section) => delete section._id)

        /** 
         * From userProgramModuleActivityData, for each activity, add: 
         * [X]  status
         * [X]  favouriteStatus 
         */

        fetchData.status = userProgramModuleActivityData.status
        fetchData.favouriteStatus = userProgramModuleActivityData.favouriteStatus

        cb()
      })
    },
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { activity: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

/**
 * GET /user/programs/programId/modules/moduleId/tasks/id
 * 
 * Get a specific user program's module's tasks's complete data.
 * 
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} callback Callback function to call
 */
var getUserProfileProgramModuleTask= function (userData, params, callback) {
  var fetchData = {}
  var userProgramModuleTaskData = {}
  async.series([
    function (cb) {

      var criteria = { 
        _id: userData._id, 
        "profile.programsData": {
          "$elemMatch": {
            "programId": params.programId, 
            "modules": {"$elemMatch": {"moduleId": params.moduleId}},
            "modules.tasks": {"$elemMatch": {"taskId": params.id}}
          }
        } 
      }

      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb(ERROR.PAGE_NOT_FOUND)
        
        // userProgramModuleTaskData.status = data[0].profile.programsData
        //                         .find((program) => params.programId === program.programId).modules
        //                         .find((mod) => params.moduleId === mod.moduleId).tasks
        //                         .find((task) => params.id === task.taskId).status

        const a = data[0].profile
        if (!a) return cb(CUSTOM_ERROR_404('PROFILE'))
        
        const b = a.programsData
        if (!b) return cb(CUSTOM_ERROR_404('PROGRAMS DATA'))
        
        const c = b.find((program) => params.programId === program.programId)
        if (!c) return cb(CUSTOM_ERROR_404('PROGRAM'))
        
        const d = c.modules
        if (!d) return cb(CUSTOM_ERROR_404('PROGRAM MODULES'))
        
        const e = d.find((mod) => params.moduleId === mod.moduleId)
        if (!e) return cb(CUSTOM_ERROR_404('MODULE'))
        
        const f = e.tasks
        if (!f) return cb(CUSTOM_ERROR_404('MODULE TASKS'))
        
        const g = f.find((task) => params.id === task.taskId)
        if (!g) return cb(CUSTOM_ERROR_404('TASK'))
        
        const h = g.status
        if (!h) return cb(CUSTOM_ERROR_404('TASK STATUS'))

        userProgramModuleTaskData.status = h
        userProgramModuleTaskData.submissions = g.submissions
        
        userProgramModuleTaskData.favouriteStatus = data[0].profile.favouriteTasks.filter(function(userFavTask) {
          return userFavTask.programId === params.programId && userFavTask.moduleId === params.moduleId && userFavTask.id === params.id
        }).length > 0

        cb()
      })

    },
    function (cb) {
      var criteria = {id: params.programId}
      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        if (undefined === data[0].modules.find((mod) => params.moduleId === mod)) return cb("This program doesn't have that module")

        cb()
      })
    },
    function (cb) {
      var criteria = { id: params.moduleId }
      ModuleService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULE NOT FOUND")
        if (undefined === data[0].activities.find((activity) => params.id === activity)) return cb("This module doesn't have that task")

        cb()
      })
    },
    function (cb) {
      var criteria = { id: params.id }
      var projection = ''
      TaskService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("TASK NOT FOUND")

        delete data[0]._id
        fetchData = data[0]
        fetchData.data.questionSet.forEach((question) => delete question._id)

        /** 
         * From userProgramModuleTaskData, for each task, add: 
         * [X]  status
         * [X]  favouriteStatus 
         */

        fetchData.status = userProgramModuleTaskData.status
        fetchData.submissions = userProgramModuleTaskData.submissions
        fetchData.favouriteStatus = userProgramModuleTaskData.favouriteStatus

        cb()
      })
    },
  ],
  function (err) {
    if (err) callback(err)
    else callback(null, { task: HELPER.deleteUnnecessaryUserData(fetchData) })
  }
  )
}

module.exports = {
  getUserProfilePrograms: getUserProfilePrograms,
  getUserProfileProgram: getUserProfileProgram,
  getUserProfileProgramModule: getUserProfileProgramModule,
  completeUserProfileProgramModule: completeUserProfileProgramModule,
  activateUserProfileProgramModule, activateUserProfileProgramModule,
  getUserProfileProgramModuleResources: getUserProfileProgramModuleResources,
  getUserProfileProgramModuleActivity: getUserProfileProgramModuleActivity,
  getUserProfileProgramModuleTask: getUserProfileProgramModuleTask
}
