'use strict'

var HELPER = require('../utils/helper')
var CONTROLLERS = require('../controllers')
var Joi = require('joi')
var APP_CONSTANTS = require('../config/appConstants')

var getProgramsList = {
  method: 'GET',
  path: '/api/user/programs',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.getUserProfilePrograms(userData, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: 'Get user programs',
    auth: 'UserAuth',
    tags: ['api', 'programs'],
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

var getProgram = {
  method: 'GET',
  path: '/api/user/programs/{id}',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.getUserProfileProgram(userData, request.params, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: 'Get a specific user program',
    auth: 'UserAuth',
    tags: ['api', 'program'],
    validate: {
      headers: HELPER.authorizationHeaderObj,
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
  path: '/api/user/programs/{programId}/modules/{id}',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.getUserProfileProgramModule(userData, request.params, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: 'Get a specific user program module with a list of activities, tasks and resources',
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

var completeModule = {
  method: 'PUT',
  path: '/api/user/programs/{programId}/modules/{id}/complete',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.completeUserProfileProgramModule(userData, request.params, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: 'Update a specific user program module',
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

var activateModule = {
  method: 'PUT',
  path: '/api/user/programs/{programId}/modules/{id}/activate',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.activateUserProfileProgramModule(userData, request.params, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: 'Activate a specific user program module',
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

var getActivity = {
  method: 'GET',
  path: '/api/user/programs/{programId}/modules/{moduleId}/activities/{id}',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.getUserProfileProgramModuleActivity(userData, request.params, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: 'Get a specific user module activity',
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
  path: '/api/user/programs/{programId}/modules/{id}/resources',
  handler: function (request, response) {
    var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
    if (userData && userData._id) {
      CONTROLLERS.UsersController.getUserProfileProgramModuleResources(userData, request.params, function (error, success) {
        if (error) {
          response(HELPER.sendError(error));
        } else {
          response(HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, success));
        }
      });
    } else {
      response(HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN));
    }
  },
  config: {
    description: "Get a user module's resources [NI]",
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

module.exports = [
  getProgramsList,
  getProgram,
  getModule,
  completeModule,
  getActivity,
  getResources
]

const config = require('../../yamlObjects')
const automaticActivationConfig = config.automaticActivation

if (!automaticActivationConfig.modules()) module.exports.push(activateModule)
