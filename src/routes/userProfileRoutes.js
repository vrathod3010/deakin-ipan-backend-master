'use strict'

var HELPER = require('../utils/helper')
var CONTROLLERS = require('../controllers')
var Joi = require('joi')
var APP_CONSTANTS = require('../config/appConstants')

var getProfile = {
  method: 'GET',
  path: '/api/user/profile',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null
    if (userData && userData._id) {
      CONTROLLERS.UsersController.getProfile(userData, function (error, success) {
        if (error) {
          response(HELPER.sendError(error))
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN))
    }
  },
  config: {
    description: 'Get profile of user',
    auth: 'UserAuth',
    tags: ['api', 'user', 'profile'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      failAction: HELPER.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const EVENT_HANDLER = require('../lib/eventHandler')
const TRACKING_HANDLER = require('../lib/trackingHandler')

var trackEvent = {
  method: 'POST',
  path: '/api/track',
  handler: function (request, response) {
    const data = JSON.parse(request.payload.data)
    if (data.data.length === 0) return response(HELPER.sendError('NO EVENTS DATA'))

    if (!EVENT_HANDLER.hasEvent(data.data[0].event)) return response(HELPER.sendError('UNREGISTERED EVENT'))

    TRACKING_HANDLER.persistTrackingData(data, (error, success) => {
      if (error) return response(HELPER.sendError(error))
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
    })
  },
  config: {
    description: 'Track user activity',
    tags: ['api', 'tracking'],
    validate: {
      failAction: HELPER.failActionFunction,
      payload: {
        data: Joi.string().trim().required()
      }
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

var getTrackingData = {
  method: 'GET',
  path: '/api/trackingData',
  handler: function (request, response) {
    TRACKING_HANDLER.getTrackingData((error, success) => {
      if (error) return response(HELPER.sendError(error))
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
    })
  },
  config: {
    description: 'Get tracking data',
    tags: ['api', 'tracking'],
    validate: {
      failAction: HELPER.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

var userProfileRoutes = [
  getProfile,
  trackEvent,
  getTrackingData
]

module.exports = userProfileRoutes
