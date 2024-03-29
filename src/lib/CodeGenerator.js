'use strict';

var async = require('async');
var _ = require('underscore');
var UniversalFunctions = require('../Utils/helper');
var Services = require('../Services');

exports.generateUniqueCode = function (noOfDigits, userRole, callback) {
  noOfDigits = noOfDigits || 5;
  var excludeArray = [];
  var generatedRandomCode = null;

  async.series([
    function (cb) {
      //Push All generated codes in excludeArray
      if (userRole === APP_CONSTANTS.DATABASE.USER_ROLES.USER) {
        Services.UserService.getAllGeneratedCodes(function (err, dataAry) {
          if (err) {
            cb(err);
          } else {
            if (dataAry && dataAry.length > 0) {
              excludeArray = dataAry
            }
            cb();
          }
        })
      }
      else {
        cb(APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
      }
    },
    function (cb) {
      //Generate Random Code of digits specified
      generatedRandomCode = generateRandomNumbers(noOfDigits, excludeArray);
      cb();
    }],
    function (err, data) {
      callback(err, { number: generatedRandomCode })
    }
  );
};

exports.generateUniqueReferralCode = function (noOfDigits, userRole, callback) {
  noOfDigits = noOfDigits || 5;
  var excludeArray = [];
  var generatedRandomCode = null;

  async.series([
    function (cb) {
      //Push All generated codes in excludeAry
      if (userRole === APP_CONSTANTS.DATABASE.USER_ROLES.INVITED_USER) {
        Services.InvitedUserService.getAllGeneratedReferralCodes(function (err, dataAry) {
          if (err) {
            cb(err);
          } else {
            if (dataAry && dataAry.length > 0) {
              excludeArray = dataAry
            }
            cb();
          }
        })
      } else {
        cb(APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR)
      }
    },
    function (cb) {
      //Generate Random Code of digits specified
      generatedRandomCode = generateRandomNumbers(noOfDigits, excludeArray);
      cb();
    }],
    function (err, data) {
      callback(err, { number: generatedRandomCode })
    }
  );
};

var generateRandomNumbers = function (numberLength, excludeList) {
  var arrayList = [];
  excludeList = excludeList || [];
  var minString = "0";
  var maxString = "9";

  for (var i = 1; i < numberLength; i++) {
    minString = minString + "0";
    maxString = maxString + "9";
  }

  var minNumber = parseInt(minString);
  var maxNumber = parseInt(maxString);

  //Create list
  for (i = minNumber; i < maxNumber; i++) {
    var digitToCheck = i.toString();
    if (digitToCheck.length < numberLength) {
      var diff = numberLength - digitToCheck.length;
      var zeros = '';
      for (var j = 0; j < diff; j++) {
        zeros += Math.floor((Math.random() * 10) + 1);
      }
      digitToCheck = zeros + digitToCheck
    }
    if (digitToCheck < 999999)
      if (excludeList.indexOf(digitToCheck) === -1) {
        arrayList.push(digitToCheck)
      }
  }

  if (arrayList.length > 0) {
    arrayList = _.shuffle(arrayList);
    return arrayList[0];
  } else {
    return false;
  }
};
