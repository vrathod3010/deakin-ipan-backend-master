'use strict'

var HELPER = require('../utils/helper')
var CONTROLLERS = require('../controllers')
var Joi = require('joi')
var APP_CONSTANTS = require('../config/appConstants')

const getUserTask = {
  method: 'GET',
  path: '/api/user/programs/{programId}/modules/{moduleId}/tasks/{id}',
  handler: (request, response) => {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN))
    
    CONTROLLERS.UsersController.getUserProfileProgramModuleTask(userData, request.params, (error, success) => {
      if (error) return response(HELPER.sendError(error))
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
    })
  },
  config: {
    description: 'Get a specific user module task',
    auth: 'UserAuth',
    tags: ['api', 'program'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      params: {
        programId: Joi.number().required(),
        moduleId: Joi.number().required(),
        id: Joi.number().required()
      },
      failAction: HELPER.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const postTaskSubmission = {
  method: 'POST',
  path: '/api/user/programs/{programId}/modules/{moduleId}/tasks/{id}/submit',
  handler: (request, response) => {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN))
    
    CONTROLLERS.UsersController.postUserProfileProgramModuleTaskSubmission(userData, request.params, request.payload, (error, success) => {
      if (error) return response(HELPER.sendError(error))
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
    })
  },
  config: {
    description: 'Post a task submission',
    auth: 'UserAuth',
    tags: ['api', 'program'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      params: {
        programId: Joi.number().required(),
        moduleId: Joi.number().required(),
        id: Joi.number().required()
      },
      payload: {
        data: Joi.string().trim().required()
      },
      failAction: HELPER.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

module.exports = [
  getUserTask,
  postTaskSubmission
]
