'use strict';

var HELPER = require('../utils/helper');
var CONTROLLERS = require('../controllers');
var Joi = require('joi');
var APP_CONSTANTS = require('../config/appConstants');
var DUMMY_DATA = require('./dummyData/data');

var getFavouriteModules = {
  method: 'GET',
  path: '/api/user/favourites/modules',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    
    CONTROLLERS.UsersController.getFavouriteModules(userData, function (error, success) {
      if (error) return response(HELPER.sendError(error));
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
    });
  },
  config: {
    description: 'Get user favourite modules [NI]',
    auth: 'UserAuth',
    tags: ['api', 'favourites'],
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

var toggleFavouriteModule = {
  method: 'PUT',
  path: '/api/user/favourites/modules/{id}/toggle',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    
    CONTROLLERS.UsersController.toggleFavouriteModule(userData, request, function (error, success) {
      if (error) return response(HELPER.sendError(error));
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
    });
  },
  config: {
    description: 'Toggle user favourite module [NI]',
    auth: 'UserAuth',
    tags: ['api', 'favourites'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      failAction: HELPER.failActionFunction,
      params: {
        id: Joi.number().required()
      },
      query: {
        programId: Joi.number().required()
      }
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

var getFavouriteActivities = {
  method: 'GET',
  path: '/api/user/favourites/activities',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    
    CONTROLLERS.UsersController.getFavouriteActivities(userData, function (error, success) {
      if (error) return response(HELPER.sendError(error));
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
    });
  },
  config: {
    description: 'Get user favourite activities [NI]',
    auth: 'UserAuth',
    tags: ['api', 'favourites'],
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

var toggleFavouriteActivity = {
  method: 'PUT',
  path: '/api/user/favourites/activities/{id}/toggle',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    
    CONTROLLERS.UsersController.toggleFavouriteActivity(userData, request, function (error, success) {
      if (error) return response(HELPER.sendError(error));
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
    });
  },
  config: {
    description: 'Toggle user favourite activity [NI]',
    auth: 'UserAuth',
    tags: ['api', 'favourites'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      failAction: HELPER.failActionFunction,
      params: {
        id: Joi.number().required()
      },
      query: {
        programId: Joi.number().required(),
        moduleId: Joi.number().required()
      }
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

var getFavouriteTasks = {
  method: 'GET',
  path: '/api/user/favourites/tasks',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    
    CONTROLLERS.UsersController.getFavouriteTasks(userData, function (error, success) {
      if (error) return response(HELPER.sendError(error));
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
    });
  },
  config: {
    description: 'Get user favourite tasks [NI]',
    auth: 'UserAuth',
    tags: ['api', 'favourites'],
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

var toggleFavouriteTask = {
  method: 'PUT',
  path: '/api/user/favourites/tasks/{id}/toggle',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (!userData || !userData._id) return response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    
    CONTROLLERS.UsersController.toggleFavouriteTask(userData, request, function (error, success) {
      if (error) return response(HELPER.sendError(error));
      
      response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
    });
  },
  config: {
    description: 'Toggle user favourite task [NI]',
    auth: 'UserAuth',
    tags: ['api', 'favourites'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      failAction: HELPER.failActionFunction,
      params: {
        id: Joi.number().required()
      },
      query: {
        programId: Joi.number().required(),
        moduleId: Joi.number().required()
      }
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


const ProgramRoutes = [
  getFavouriteModules,
  toggleFavouriteModule,

  getFavouriteActivities,
  toggleFavouriteActivity,

  getFavouriteTasks,
  toggleFavouriteTask,
]

module.exports = ProgramRoutes;
