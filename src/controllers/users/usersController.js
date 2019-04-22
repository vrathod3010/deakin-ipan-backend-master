'use strict';

const debug = require('debug')('app:usersController')
const GenericDBService = require('../../genricDBService');
const UserService = new GenericDBService("User");
const UserNotificationService = new GenericDBService("UserNotification");
var HELPER = require('../../utils/helper');
var APP_CONSTANTS = require('../../config/appConstants');
var async = require('async');
var TOKEN_MANAGER = require('../../lib/tokenManager');
var ERROR = APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require('underscore');

var createUser = function (payloadData, callback) {
  var accessToken = null;
  var uniqueCode = null;
  var dataToSave = payloadData;

  if (dataToSave.password)
    dataToSave.password = HELPER.CryptData(dataToSave.password);

  var userFound;
  var dataToUpdate = {};
  async.series([
    function (cb) {
      var query = {
        emailId: payloadData.emailId
      };
      UserService.getRecord(query, {}, {}, function (error, data) {
        if (error) {
          cb(error);
        } else {
          debug(data, data.length);
          if (data && data.length > 0) {
            cb(ERROR.USER_ALREADY_REGISTERED)
          } else {
            cb(null);
          }
        }
      });

    },
    function (cb) {
      // Insert Into DB
      UserService.createRecord(dataToSave, function (err, userDataFromDB) {
        if (err) {
          debug('Error: ', err, userDataFromDB)
          cb(err)
        } else {
          userFound = userDataFromDB;
          cb();
        }
      })
    },
    function (cb) {
      // Set Access Token
      if (userFound) {
        var tokenData = {
          id: userFound._id,
          type: payloadData.role
        };
        TOKEN_MANAGER.setToken(tokenData, function (err, output) {
          if (err) {
            cb(err);
          } else {
            accessToken = output && output.accessToken || null;
            cb();
          }
        })
      } else {
        cb(ERROR.IMP_ERROR)
      }
    },
    function (cb) {
      var criteria = {
        _id: userFound._id
      }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (data && data[0]) {
          userFound = data[0];
          cb()
        }
        else cb(err)
      })
    }
  ],
    function (err, data) {
      if (err) {
        callback(err);
      } else {
        callback(null, {
          accessToken: accessToken,
          userDetails: userFound
        });
      }
    });
};


var loginUser = function (payloadData, callback) {
  var userFound;
  var accessToken = null;
  var successLogin = false;
  async.series([
    function (cb) {
      var query = {
        emailId: payloadData.emailId
      };
      UserService.getRecord(query, {}, {}, function (err, result) {
        if (err) {
          cb(err)
        } else {
          userFound = result && result[0] || null;
          cb();
        }
      });
    },
    function (cb) {
      // validations
      if (!userFound) {
        cb(APP_CONSTANTS.STATUS_MSG.ERROR.USER_NOT_FOUND);
      } else {
        if (userFound && userFound.password !== HELPER.CryptData(payloadData.password)) {
          cb(APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
        }
        else {
          successLogin = true;
          debug(userFound);
          cb();
        }
      }
    },
    function (cb) {
      if (successLogin) {
        var tokenData = {
          id: userFound._id,
          // type: userFound.role
        };
        TOKEN_MANAGER.setToken(tokenData, function (err, output) {
          if (err) {
            cb(err);
          } else {
            accessToken = output && output.accessToken || null;
            cb();
          }
        })
      } else {
        cb(ERROR.IMP_ERROR)
      }
    },
    function (cb) {
      var criteria = {
        _id: userFound._id
      }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (data && data[0]) {
          userFound = data[0];
          cb()
        }
        else cb(err)
      })
    },
    function (cb) {
      var maxDate = new Date()

      var criteria = { userId: userFound._id, deliverDateTime: { $lte: maxDate } }
      UserNotificationService.getRecord(criteria, {}, {}, (err, data) => {
        if (err) return cb(err)
        if (data.length === 0) return cb()

        data.forEach((notification) => {
          delete notification.createdAt
          delete notification.updatedAt
          delete notification.__v
        })
        userFound.notifications = data
        cb()
      })
    }
  ],
    function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, {
          accessToken: accessToken,
          userDetails: HELPER.deleteUnnecessaryUserData(userFound)
        });
      }
    });
};


var accessTokenLogin = function (userData, callback) {
  var userFound;
  async.series([
    function (cb) {
      var criteria = { _id: userData._id }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length === 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
          else {
            userFound = data[0];
            cb()
          }
        }
      })
    },
    function (cb) {
      var maxDate = new Date()

      var criteria = { userId: userData.id, deliverDateTime: { $lte: maxDate } }
      UserNotificationService.getRecord(criteria, {}, {}, (err, data) => {
        if (err) return cb(err)
        if (data.length === 0) return cb()

        data.forEach((notification) => {
          delete notification.createdAt
          delete notification.updatedAt
          delete notification.__v
        })
        userFound.notifications = data
        cb()
      })
    }
  ],
    function (err) {
      if (err) return callback(err);
      callback(null, {
        accessToken: userFound.accessToken,
        userDetails: userFound // TODO: change this to whatever data is required or remove it
      });
    });
}

var changePassword = function (userData, payloadData, callbackRoute) {
  var userFound;
  var oldPassword = HELPER.CryptData(payloadData.oldPassword);
  var newPassword = HELPER.CryptData(payloadData.newPassword);
  async.series([
    function (cb) {
      var criteria = {
        _id: userData.id
      }
      UserService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length === 0) cb(ERROR.INCORRECT_ACCESSTOKEN)
          else {
            userFound = data[0];

            if (userFound.password === oldPassword && userFound.password !== newPassword) {
              cb(null);
            }
            else if (userFound.password !== oldPassword) {
              cb(ERROR.WRONG_PASSWORD)
            }
            else if (userFound.password === newPassword) {
              cb(ERROR.NOT_UPDATE)
            }
          }
        }
      })
    },
    function (callback) {
      var dataToUpdate = { $set: { 'password': newPassword } };
      var condition = { _id: userData.id };
      UserService.updateRecord(condition, dataToUpdate, {}, function (err, user) {
        if (err) {
          callback(err);
        } else {
          if (!user || user.length === 0) {
            callback(ERROR.NOT_FOUND);
          }
          else {
            callback(null);
          }
        }
      });
    }
  ],
    function (error, result) {
      if (error) {
        return callbackRoute(error);
      } else {
        return callbackRoute(null);
      }
    });
}

module.exports = {
  createUser: createUser,
  loginUser: loginUser,
  accessTokenLogin: accessTokenLogin,
  changePassword: changePassword
};
