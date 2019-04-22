const debug = require('debug')('app:nSynthesizer')
const GenericDBService = require('../genricDBService')
const SERVICES = {
  user: new GenericDBService("User")
}

const PLACEHOLDER_PREFIX = "@#!", PLACEHOLDER_REGEX = /\@\#\!\w+/gmi

const searchPlaceholders = function (str, cb) {
  if (str.length === 0) return cb([])
  var results = [], indices = [] //this is the results you want
  while ((result = PLACEHOLDER_REGEX.exec(str))) {
    results.push(result[0])
    indices.push(result.index)
  }
  
  cb(results, indices)
}

const replacePlaceholders = function (str, user, additionalData, cb) {
  searchPlaceholders(str, (results) => {
    for (let i = 0; i < results.length; ++i) {
      getValue(results[i], user, additionalData, (err, value) => {
        if (err) return cb(err)
        str = str.replace(results[i], value)
      })
    }
  })
  return cb(null, str)
}

const getValue = function (key, user, additionalData, callback) {
  key = key.substring(PLACEHOLDER_PREFIX.length)
  switch (key) {
    case "firstName":
      return callback(null, user.firstName)
      // return getDatabaseField("user.firstName", data, callback)
    case "moduleTitle":
      return callback(null, additionalData.title)
    default:
      return callback(null, 'lolcake')
  }
}

const getDatabaseField = function (field, user, additionalData, cb) {
  let fieldClone1 = field.slice(), fieldClone2 = field.slice()
  let arr = fieldClone1.split(".", 1)
  let getField = fieldClone2.substr(fieldClone2.indexOf(".") + 1)

  let projection = {}
  projection[getField] = 1
  projection["_id"] = 0

  debug(arr, getField)

  SERVICES[arr[0]].getRecord({ id: additionalData.id }, projection, {}, (err, data) => {
    if (err) return cb(err)
    if (data.length === 0) return cb("No data found for " + field + " for the given params")

    //TODO: Test this function and remove this debug
    debug('wassssssssssssssssssssssup', data)

    cb(null, data[0])
  })
}

// var sss = "In this string, @#!this and @#!thisaswell as well will be replaced. Hello @#!firstName"
// replacePlaceholders(sss, {id: 1}, (err, data) => {
//   if (err) return debug(err)
//   debug(data)
// })

module.exports = {
  replacePlaceholders: replacePlaceholders
}
