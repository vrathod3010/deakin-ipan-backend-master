'use strict'

const SERVICES = require('../../services.js')
const UserService = SERVICES.UserService
const ProgramService = SERVICES.ProgramService
const ModuleService = SERVICES.ModuleService
const TaskService = SERVICES.TaskService
const HELPER = require('../../utils/helper')
const APP_CONSTANTS = require('../../config/appConstants')
const async = require('async')
const ERROR = APP_CONSTANTS.STATUS_MSG.ERROR
const CUSTOM_ERROR_404 = APP_CONSTANTS.CUSTOM_ERROR_404
const CUSTOM_ERROR = APP_CONSTANTS.CUSTOM_ERROR

/**
 * TODO: Add all tasks related controllers here
 * 
 * get user task
 * post user task submission
 * get user task submissions
 */

/**
 * POST /user/programs/programId/modules/moduleId/tasks/id/submit
 * 
 * Post a specific user program's module's task's submission.
 * 
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} payload Payload data
 * @param {*} callback Callback function to call
 */
const postUserProfileProgramModuleTaskSubmission = function (userData, params, payload, callback) {
  var taskData
  var userCriteria = { 
    _id: userData._id, 
    "profile.programsData": {
      "$elemMatch": {
        "programId": params.programId, 
        "modules": {"$elemMatch": {"moduleId": params.moduleId}},
        "modules.tasks": {"$elemMatch": {"taskId": params.id}}
      }
    } 
  }

  async.series([
    function (cb) {
      UserService.getRecord(userCriteria, {}, {}, function (err, data) {
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
      const criteria = { id: params.id }
      const projection = { _id: 0, "data.questionSet._id": 0 }
      TaskService.getRecord(criteria, projection, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("TASK NOT FOUND")

        taskData = data[0]

        cb()
      })
    },
    function (cb) {
      /**
       * Parse payload data
       * Check if every question ID exists 
       * Check if every answer is a valid answer for each question
       * 
       */

      if (!payload.data) return cb('NO Q&A DATA')

      let qaArr = JSON.parse(payload.data)
      if (!Array.isArray(qaArr)) return cb('DATA NOT ARRAY')

      if (qaArr.length !== taskData.data.questionSet.length ) return cb("NUMBER OF QUESTIONS AND SUBMITTED ANSWERS DIFFER")

      if (!qaArr.every(set => set.questionId && set.hasOwnProperty("answeredOptionId") && 
            taskData.data.questionSet.find(tQSet => tQSet.id === set.questionId && set.answeredOptionId >= 0 && set.answeredOptionId < tQSet.options.length )))
        return cb('INVALID DATA FOR ANSWERS')

      const dataToPut = { "$push": { "profile.programsData.$[p].modules.$[m].tasks.$[t].submissions": { data: qaArr } }, "$set": { "profile.programsData.$[p].modules.$[m].tasks.$[t].status": "COMPLETE" } }
      const options = { "arrayFilters": [{ "p.programId": params.programId }, { "m.moduleId": params.moduleId }, { "t.taskId": params.id }] }

      UserService.updateRecord(userCriteria, dataToPut, options, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("TASK NOT FOUND")

        cb()
      })      
    }
  ],
  function (err) {
    if (err) return callback(err)
    callback(null, { message: "ANSWERS SUBMITTED SUCCESSFULLY" })
  }
  )
}

module.exports = {
  postUserProfileProgramModuleTaskSubmission: postUserProfileProgramModuleTaskSubmission
}
