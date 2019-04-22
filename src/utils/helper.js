'use strict';

const debug = require('debug')('app:helper')
var joi = require('joi');
var md5 = require('md5');
var boom = require('boom');
var APP_CONSTANTS = require('../config/appConstants');
var randomString = require("randomstring");
var validator = require('validator');
var moment = require('moment');
var momentRange = require('moment-range');
var async = require('async');

var moment = momentRange.extendMoment(moment);

// Constants
const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Function to generate and return error messages
 * 
 * @param {*} data 
 */
var sendError = function (data) {
  console.trace('ERROR OCCURED', data);

  if (typeof data === 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {

    debug('Attaching responsetype', data.type);
    var errorToSend = boom.create(data.statusCode, data.customMessage);
    errorToSend.output.payload.responseType = data.type;

    return errorToSend;

  } else {

    var errorToSend = '';
    if (typeof data === 'object') {

      if (data.name === 'MongoError') {

        errorToSend += APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
        if (data.code = 11000) {

          var duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
          duplicateValue = duplicateValue.replace('}', '');
          errorToSend += APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + " : " + duplicateValue;

          if (data.message.indexOf('customer_1_streetAddress_1_city_1_state_1_country_1_zip_1') > -1) {

            errorToSend = APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_ADDRESS.customMessage;
          }
        }
      } else if (data.name === 'ApplicationError') {

        errorToSend += APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + ' : ';
      } else if (data.name === 'ValidationError') {

        errorToSend += APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + data.message;
      } else if (data.name === 'CastError') {

        errorToSend += APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage +
          APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage + data.value;
      }
    } else {

      errorToSend = data
    }

    var customErrorMessage = errorToSend;
    if (typeof customErrorMessage === 'string') {

      if (errorToSend.indexOf("[") > -1) {
        customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
      }

      customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
      customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
      customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');
    }

    return boom.create(400, customErrorMessage)
  }
};


/**
 * Function to create and return a success message
 * 
 * @param {*} successMsg 
 * @param {*} data 
 */
var sendSuccess = function (successMsg, data) {
  successMsg = successMsg || APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT.customMessage;

  if (typeof successMsg === 'object' && successMsg.hasOwnProperty('statusCode') &&
    successMsg.hasOwnProperty('customMessage')) {

    return {
      statusCode: successMsg.statusCode,
      message: successMsg.customMessage,
      data: data || {}
    };
  } else {

    return { statusCode: 200, message: successMsg, data: data || {} };
  }
};


/**
 * Function to create and return a custom error message
 * 
 * @param {*} request 
 * @param {*} reply 
 * @param {*} source 
 * @param {*} error 
 */
var failActionFunction = function (request, reply, source, error) {

  var customErrorMessage = '';
  if (error.output.payload.message.indexOf("[") > -1) {

    customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
  } else {

    customErrorMessage = error.output.payload.message;
  }

  customErrorMessage = customErrorMessage.replace(/"/g, '');
  customErrorMessage = customErrorMessage.replace('[', '');
  customErrorMessage = customErrorMessage.replace(']', '');

  error.output.payload.message = customErrorMessage;
  delete error.output.payload.validation

  return reply(error);
};

var authorizationHeaderObj = joi.object({

  authorization: joi.string().required()
}).unknown();


/**
 * Function to generate and return a random string
 */
var generateRandomString = function () {

  return randomString.generate(12);
};


/**
 * Function to generate and return a random number
 */
var generateRandomNumber = function () {

  var num = Math.floor(Math.random() * 90000) + 10000;
  return num;
};


/**
 * Function to generate a random string of the passed 
 * length
 * 
 * @param {*} len 
 */
var generateRandomAlphabet = function (len) {

  var randomString = '';

  for (var i = 0; i < len; i++) {

    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
    randomString = randomString.toUpperCase();
  }
  return randomString;
}


/**
 * Function to create an MD5 hash of a passed string
 * 
 * @param {*} stringToCrypt 
 */
var CryptData = function (stringToCrypt) {

  return md5(md5(stringToCrypt));
};


/**
 * Function to validate latitude and longitude values
 * 
 * @param {*} lat 
 * @param {*} long 
 */
var validateLatLongValues = function (lat, long) {
  var valid = true;
  if (lat < -90 || lat > 90) {
    valid = false;
  }
  if (long < -180 || long > 180) {
    valid = false;
  }
  return valid;
};


/**
 * Function to match string against a passed pattern
 * 
 * @param {*} str 
 * @param {*} pattern 
 */
var validateString = function (str, pattern) {

  debug(str, pattern, str.match(pattern));
  return str.match(pattern);
};


/**
 * Function to check if a string is a valid email
 * 
 * @param {*} string 
 */
var verifyEmailFormat = function (string) {

  return validator.isEmail(string)
};


/**
 * Function to clear an object
 * 
 * @param {*} userObj 
 */
var deleteUnnecessaryUserData = function (obj) {

  if (obj._id) delete obj._id;
  delete obj.__v; // For some reason adding an if condition here isn't working fine
  if (obj.password) delete obj.password;
  if (obj.createdAt) delete obj.createdAt;
  if (obj.updatedAt) delete obj.updatedAt;
  if (obj.OTPCode) delete obj.OTPCode;
  if (obj.accessToken) delete obj.accessToken;
  
  return obj;
};


/**
 * Function to generate a new filename with extension
 * 
 * @param {*} oldFilename 
 * @param {*} newFilename 
 */
var generateFilenameWithExtension = function generateFilenameWithExtension(oldFilename, newFilename) {

  return newFilename + '.' +
    oldFilename.substr((~-oldFilename.lastIndexOf(".") >>> 0) + 2);
}


/**
 * Function to check for null or empty objects
 * 
 * @param {*} obj 
 */
var isEmpty = function (obj) {

  return (null !== obj && (object.length && 0 !== obj.length));
}

/**
 * What is this doing?
 * 
 * @param {*} inDate 
 */
var getTimestamp = function (inDate) {

  return inDate ? new Date() : new Date().toISOString();
};


/**
 * TODO: figure out what this does
 * 
 * @param {*} List 
 * @param {*} keyName 
 */
var createArray = function (list, keyName) {

  debug("create array------>>>>>>>")
  var idArray = [];
  var keyName = keyName;

  for (var key in list) {

    if (list.hasOwnProperty(key)) {
      idArray.push((list[key][keyName]).toString());
    }
  }

  return IdArray;
};


/**
 * Function to get a date range
 * 
 * @param {*} startDate 
 * @param {*} endDate 
 * @param {*} diffIn 
 */
function getRange(startDate, endDate, diffIn) {

  var dr = moment.range(startDate, endDate);

  if (!diffIn)
    diffIn = APP_CONSTANTS.TIME_UNITS.HOURS;
  if (diffIn === "milli")
    return dr.diff();

  return dr.diff(diffIn);
}

/**
 * Function for async forEach loop on an array
 * @param {*} array 
 * @param {*} callback 
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/** In @param str, if the last character is a /, removes it
 * @returns str
 */
const sanitizedUrl = function (str) {
  return str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str
}

/**
 * Export module functions
 */
module.exports = {
  generateRandomString: generateRandomString,
  CryptData: CryptData,
  sendError: sendError,
  sendSuccess: sendSuccess,
  failActionFunction: failActionFunction,
  authorizationHeaderObj: authorizationHeaderObj,
  //forgetPasswordEmail: forgetPasswordEmail,
  validateLatLongValues: validateLatLongValues,
  validateString: validateString,
  verifyEmailFormat: verifyEmailFormat,
  deleteUnnecessaryUserData: deleteUnnecessaryUserData,
  generateFilenameWithExtension: generateFilenameWithExtension,
  isEmpty: isEmpty,
  getTimestamp: getTimestamp,
  generateRandomNumber: generateRandomNumber,
  createArray: createArray,
  generateRandomAlphabet: generateRandomAlphabet,
  getRange: getRange,
  asyncForEach: asyncForEach,
  sanitizedUrl: sanitizedUrl
};
