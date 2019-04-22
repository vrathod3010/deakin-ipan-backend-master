const debug = require('debug')('app:nEngine')

var NOTIFICATIONS_ENGINE = require('../lib/notificationsEngine')
var HELPER = require('../utils/helper')
var Joi = require('joi')
var APP_CONSTANTS = require('../config/appConstants')

var users = [{id: 1}]
users = 'ALL'

const triggerEngine = {
  method: 'GET',
  path: '/api/triggerEngine',
  handler: function (request, response) {
    NOTIFICATIONS_ENGINE.triggerEngine("NEWSLETTER", users, {}, (error, success) => {
      if (error) return response(HELPER.sendError(error))
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success))
    })
  },
  config: {
    description: 'Trigger notifications engine',
    tags: ['api', 'engine'],
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

const blah = [
  triggerEngine
]
module.exports = blah
