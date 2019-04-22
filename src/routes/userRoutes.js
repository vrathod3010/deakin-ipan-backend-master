"use strict";

var HELPER = require("../utils/helper");
var CONTROLLERS = require("../controllers");
var Joi = require("joi");
var APP_CONSTANTS = require("../config/appConstants");

var register = {
  method: "POST",
  path: "/api/user/register",
  handler: function(request, reply) {
    var payloadData = request.payload;
    if (!HELPER.verifyEmailFormat(payloadData.emailId)) {
      reply(
        HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_FORMAT)
      );
    } else {
      CONTROLLERS.UsersController.createUser(payloadData, function(err, data) {
        if (err) {
          reply(HELPER.sendError(err));
        } else {
          reply(
            HELPER.sendSuccess(APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)
          ).code(201);
        }
      });
    }
  },
  config: {
    description: "Register a new user",
    tags: ["api", "user"],
    validate: {
      payload: {
        firstName: Joi.string()
          .trim()
          .regex(/^[a-zA-Z]+$/)
          .min(2)
          .max(16)
          .required(),
        lastName: Joi.string()
          .trim()
          .regex(/^[a-zA-Z]+$/)
          .min(2)
          .max(16)
          .required(),
        emailId: Joi.string()
          .trim()
          .required(),
        password: Joi.string()
          .min(8)
          .max(16)
          .required(),
        profile: {
          dob: Joi.string().trim(),
          gender: Joi.string()
            .trim()
            .valid(["MALE", "FEMALE", "OTHER"]),
          mobile: Joi.string()
            .trim()
            .regex(/^[0-9]{12}$/)
            .min(12)
            .max(12)
        }
      },
      failAction: HELPER.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

var login = {
  method: "POST",
  path: "/api/user/login",
  handler: function(request, reply) {
    var payloadData = request.payload;
    if (!HELPER.verifyEmailFormat(payloadData.emailId)) {
      reply(
        HELPER.sendError(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_FORMAT)
      );
    } else {
      CONTROLLERS.UsersController.loginUser(payloadData, function(err, data) {
        if (err) {
          reply(HELPER.sendError(err));
        } else {
          reply(HELPER.sendSuccess(null, data));
        }
      });
    }
  },
  config: {
    description: "Login via email & password for user",
    tags: ["api", "user"],
    validate: {
      payload: {
        emailId: Joi.string().required(),
        password: Joi.string()
          .required()
          .min(5)
          .trim()
      },
      failAction: HELPER.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

var accessTokenLogin = {
  method: "POST",
  path: "/api/user/accessTokenLogin",
  handler: function(request, reply) {
    var userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    CONTROLLERS.UsersController.accessTokenLogin(userData, function(err, data) {
      data.userDetails = HELPER.deleteUnnecessaryUserData(data.userDetails);
      if (!err) {
        return reply(HELPER.sendSuccess(null, data));
      } else {
        return reply(HELPER.sendError(err));
      }
    });
  },
  config: {
    description: "Access token login",
    tags: ["api", "user"],
    auth: "UserAuth",
    validate: {
      headers: HELPER.authorizationHeaderObj,
      failAction: HELPER.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

var changePassword = {
  method: "PUT",
  path: "/api/user/changePassword",
  handler: function(request, reply) {
    var userData =
      (request.auth &&
        request.auth.credentials &&
        request.auth.credentials.userData) ||
      null;
    CONTROLLERS.UsersController.changePassword(
      userData,
      request.payload,
      function(err, user) {
        if (!err) {
          return reply(
            HELPER.sendSuccess(
              APP_CONSTANTS.STATUS_MSG.SUCCESS.PASSWORD_RESET,
              user
            )
          );
        } else {
          return reply(HELPER.sendError(err));
        }
      }
    );
  },
  config: {
    description: "Change password",
    tags: ["api", "customer"],
    auth: "UserAuth",
    validate: {
      headers: HELPER.authorizationHeaderObj,
      payload: {
        oldPassword: Joi.string()
          .required()
          .min(4),
        newPassword: Joi.string()
          .required()
          .min(4)
      },
      failAction: HELPER.failActionFunction
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

var UserRoutes = [register, login, accessTokenLogin, changePassword];
module.exports = UserRoutes;
