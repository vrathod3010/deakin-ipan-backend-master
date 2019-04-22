'use strict';

var HELPER = require('../utils/helper');
var CONTROLLERS = require('../controllers');
var Joi = require('joi');
var APP_CONSTANTS = require('../config/appConstants');
var DUMMY_DATA = require('./dummyData/data');

/** TODO: 
 *  These content retrieved from these routes do not belong to any user. Reflect
 *  the changes accordingly. These routes may not even require any authentication.
 */ 

var getProgramsList = {
  method: 'GET',
  path: '/api/programs',
  handler: function (request, response) {
    CONTROLLERS.ProgramsController.getPrograms(function (error, success) {
      if (error) {
        return response(HELPER.sendError(error));
      } else {
        return response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
      }
    });
  },
  config: {
    description: 'Get programs',
    tags: ['api', 'programs'],
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

var getProgram = {
  method: 'GET',
  path: '/api/programs/{id}',
  handler: function (request, response) {
    CONTROLLERS.ProgramsController.getProgram(request.params, function (error, success) {
      if (error) {
        response(HELPER.sendError(error));
      } else {
        response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
      }
    });
  },
  config: {
    description: 'Get a specific program',
    // auth: 'UserAuth',
    tags: ['api', 'program'],
    validate: {
      // headers: HELPER.authorizationHeaderObj,
      params: {
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

var getModule = {
  method: 'GET',
  path: '/api/programs/{programId}/modules/{id}',
  handler: function (request, response) {
    CONTROLLERS.ProgramsController.getModule(request.params, function (error, success) {
      if (error) {
        response(HELPER.sendError(error));
      } else {
        response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
      }
    });
  },
  config: {
    description: 'Get a specific program module',
    tags: ['api', 'program'],
    validate: {
      params: {
        programId: Joi.number().required(),
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

/** Unused routes BEGIN */

var getActivity = {
  method: 'GET',
  path: '/api/programs/{programId}/modules/{moduleId}/activities/{id}',
  handler: function (request, response) {
    const programId = request.params.programId;
    const moduleId = request.params.moduleId;
    const id = request.params.id;
    const data = DUMMY_DATA.activityOne;
    response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data));
  },
  config: {
    description: 'Get a specific module activity',
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

var getTask = {
  method: 'GET',
  path: '/api/programs/{programId}/modules/{moduleId}/tasks/{id}',
  handler: function (request, response) {
    const programId = request.params.programId;
    const moduleId = request.params.moduleId;
    const id = request.params.id;
    const data = DUMMY_DATA.taskOne;
    response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data));
  },
  config: {
    description: 'Get a specific module task',
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

// Get links of a module
var getResources = {
  method: 'GET',
  path: '/api/programs/{programId}/modules/{id}/resources',
  handler: function (request, response) {
    const programId = request.params.programId;
    const id = request.params.id;
    const data = DUMMY_DATA.links;
    response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data));
  },
  config: {
    description: "Get a module's resources",
    auth: 'UserAuth',
    tags: ['api', 'program'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
      params: {
        programId: Joi.number().required(),
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

/** Unused routes END */

const ProgramRoutes = [
  getProgramsList,
  getProgram,
  getModule,
  // getActivity,
  // getTask,
  // getResources
]

module.exports = ProgramRoutes;
