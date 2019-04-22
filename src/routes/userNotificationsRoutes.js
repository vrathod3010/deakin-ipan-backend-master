'use strict'

var HELPER = require('../utils/helper')
var Joi = require('joi')
var APP_CONSTANTS = require('../config/appConstants')
const services = require('../services')
var CONTROLLERS = require('../controllers')
const UserNotificationService = services.UserNotificationService

var getNotification = {
  method: 'GET',
  path: '/api/user/notifications/{visitLink}',
  handler: function (request, response) {
    var criteria = { visitLink: request.params.visitLink }
    let projection = { appLink: 1 }
    UserNotificationService.getRecord(criteria, projection, {}, (error, data) => {
      if (error) return response(HELPER.sendError(error))
      if (data.length === 0) return response(HELPER.sendError(error))

      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, {appLink: data[0].appLink}))
    })
  },
  config: {
    description: 'Get notification data',
    tags: ['api', 'notification'],
    validate: {
      failAction: HELPER.failActionFunction,
      params: {
        visitLink: Joi.string().required().min(4)
      },
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

var updateNotificationStatus = {
  method: 'POST',
  path: '/api/user/notifications',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null
    if (userData && userData._id) {
      CONTROLLERS.UsersController.updateNotificationsStatus(userData, request.payload, (error, success) => {
        if (error) {
          response(HELPER.sendError(error))
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
        }
      })

    }else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN))
    }
   
  },
  config: {
    description: 'Get notification data',
    auth: 'UserAuth',
    tags: ['api', 'user','notificationStatus'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      payload: {
        data: Joi.string().required()
      },
      failAction: HELPER.failActionFunction,
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


module.exports = [
  getNotification,
  updateNotificationStatus
]
