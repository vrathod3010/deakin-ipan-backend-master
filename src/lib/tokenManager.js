'use strict';

const debug = require('debug')('app:tokenManager')
var APP_CONSTANTS = require('../config/appConstants');
var Jwt = require('jsonwebtoken');
var async = require('async');
const GenericDBService = require('../genricDBService');
const UserService = new GenericDBService("User");

var getTokenFromDB = function (userId, token, callback) {
  var criteria = {
    _id: userId,
    accessToken: token
  };
  var userData = null;

  async.series([
    function (cb) {
      UserService.getRecord(criteria, {}, { lean: true }, function (err, dataAry) {
        if (err) {
          cb(err)
        } else {
          if (dataAry && dataAry.length > 0) {
            userData = dataAry[0];
            cb();
          } else {
            cb(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN)
          }
        }
      });
    }
  ], function (err, result) {
    if (err) {
      callback(err)
    } else {
      if (userData && userData._id) {
        userData.id = userData._id;
      }
      callback(null, { userData: userData })
    }

  });
};

var setTokenInDB = function (userId, tokenToSave, callback) {
  debug("userId:", userId)
  var criteria = {
    _id: userId
  };
  var setQuery = {
    accessToken: tokenToSave
  };
  async.series([
    function (cb) {
      UserService.updateRecord(criteria, setQuery, { new: true }, function (err, dataAry) {
        if (err) {
          cb(err)
        } else {
          if (dataAry && dataAry._id) {
            cb();
          } else {
            cb(APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
          }
        }
      });
    }
  ], function (err, result) {
    if (err) {
      callback(err)
    } else {
      callback()
    }

  });
};


var verifyToken = function (token, callback) {
  var response = {
    valid: false
  };
  Jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
    if (err) {
      debug('jwt err', err, decoded)
      callback(err)
    } else {
      getTokenFromDB(decoded.id, token, callback);
    }
  });
};

var setToken = function (tokenData, callback) {
  debug('TokenData:', tokenData)
  if (!tokenData.id) { // Attach token data here using || !tokenData.whateverData
    callback(APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
  } else {
    var tokenToSend = Jwt.sign(tokenData, process.env.JWT_SECRET_KEY);
    setTokenInDB(tokenData.id, tokenToSend, function (err, data) {
      debug('token>>>>', err, data)
      callback(err, { accessToken: tokenToSend })
    })
  }
};


var decodeToken = function (token, callback) {
  Jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decodedData) {
    if (err) {
      callback(APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
    } else {
      callback(null, decodedData)
    }
  })
};

module.exports = {
  setToken: setToken,
  verifyToken: verifyToken,
  decodeToken: decodeToken
};
